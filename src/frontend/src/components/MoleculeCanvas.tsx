import { MoleculeModel } from "@/components/MoleculeModel";
import { framingDistance } from "@/lib/view-utils";
import type { Molecule } from "@/types/molecule";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>;

/** Shared camera state used to keep two canvases in lockstep. */
export interface CameraSyncState {
  position: [number, number, number];
  target: [number, number, number];
  version: number;
  source: string;
}

export type CameraSyncRef = React.MutableRefObject<CameraSyncState>;

interface MoleculeCanvasProps {
  molecule: Molecule;
  showLonePairs: boolean;
  showBondAngles: boolean;
  autoRotate: boolean;
  resetSignal: number;
  /** Optional shared camera state; when present this canvas joins the group. */
  sync?: CameraSyncRef;
  /** Identity of this canvas within the sync group. */
  syncId?: string;
}

/** Smoothly eases the camera to frame the current molecule. */
function CameraRig({
  molecule,
  resetSignal,
  controls,
}: {
  molecule: Molecule;
  resetSignal: number;
  controls: React.RefObject<OrbitControlsRef | null>;
}) {
  const { camera } = useThree();
  const target = useRef(framingDistance(molecule));
  const resetting = useRef(false);

  useEffect(() => {
    target.current = framingDistance(molecule);
    resetting.current = true;
  }, [molecule]);

  useEffect(() => {
    if (resetSignal === 0) return;
    target.current = framingDistance(molecule);
    resetting.current = true;
  }, [resetSignal, molecule]);

  useFrame((_, delta) => {
    if (!resetting.current) return;
    const distance = camera.position.length();
    const next =
      distance + (target.current - distance) * Math.min(1, delta * 4);
    camera.position.setLength(next);
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    if (Math.abs(next - target.current) < 0.02) resetting.current = false;
  });

  return null;
}

/**
 * OrbitControls that optionally publish their camera to a shared sync ref and
 * apply camera changes published by a sibling canvas. A guard flag plus a
 * small epsilon check stop the two canvases from echoing each other.
 */
function SyncedOrbitControls({
  autoRotate,
  controls,
  sync,
  syncId,
}: {
  autoRotate: boolean;
  controls: React.RefObject<OrbitControlsRef | null>;
  sync?: CameraSyncRef;
  syncId: string;
}) {
  const { camera } = useThree();
  const applying = useRef(false);
  const lastVersion = useRef(-1);

  useFrame(() => {
    if (!sync) return;
    const state = sync.current;
    if (state.version === lastVersion.current || state.source === syncId) {
      return;
    }
    lastVersion.current = state.version;
    applying.current = true;
    camera.position.set(
      state.position[0],
      state.position[1],
      state.position[2],
    );
    controls.current?.target.set(
      state.target[0],
      state.target[1],
      state.target[2],
    );
    controls.current?.update();
    applying.current = false;
  });

  const handleChange = useCallback(() => {
    if (!sync || applying.current) return;
    const target = controls.current?.target;
    if (!target) return;
    const state = sync.current;
    const moved =
      Math.abs(camera.position.x - state.position[0]) > 1e-4 ||
      Math.abs(camera.position.y - state.position[1]) > 1e-4 ||
      Math.abs(camera.position.z - state.position[2]) > 1e-4 ||
      Math.abs(target.x - state.target[0]) > 1e-4 ||
      Math.abs(target.y - state.target[1]) > 1e-4 ||
      Math.abs(target.z - state.target[2]) > 1e-4;
    if (!moved) return;
    sync.current = {
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [target.x, target.y, target.z],
      version: state.version + 1,
      source: syncId,
    };
  }, [sync, syncId, camera, controls]);

  return (
    <OrbitControls
      ref={controls}
      enablePan
      enableZoom
      enableRotate
      autoRotate={autoRotate}
      autoRotateSpeed={1.4}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={40}
      onChange={handleChange}
    />
  );
}

/**
 * Full-bleed 3D viewport. The canvas fills its container, and free
 * 360-degree orbit (pitch, yaw, roll), zoom, and pan are enabled with no polar
 * or azimuth limits; auto-rotation is driven by OrbitControls and the camera
 * reframes smoothly when the molecule changes or the view is reset. When a
 * `sync` ref is supplied the canvas joins a shared camera group.
 */
export function MoleculeCanvas({
  molecule,
  showLonePairs,
  showBondAngles,
  autoRotate,
  resetSignal,
  sync,
  syncId = "solo",
}: MoleculeCanvasProps) {
  const controls = useRef<OrbitControlsRef | null>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, framingDistance(molecule)], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
      data-ocid="molecule.canvas_target"
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 8, 6]} intensity={1.15} />
      <directionalLight position={[-6, -4, -6]} intensity={0.45} />
      <pointLight position={[0, 0, 8]} intensity={0.5} color="#5eead4" />

      <MoleculeModel
        molecule={molecule}
        showLonePairs={showLonePairs}
        showBondAngles={showBondAngles}
      />

      <SyncedOrbitControls
        autoRotate={autoRotate}
        controls={controls}
        sync={sync}
        syncId={syncId}
      />
      <CameraRig
        molecule={molecule}
        resetSignal={resetSignal}
        controls={controls}
      />
    </Canvas>
  );
}

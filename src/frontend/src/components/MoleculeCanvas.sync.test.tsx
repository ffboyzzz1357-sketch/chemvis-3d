import { render } from "@testing-library/react";
import { Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";

import { MoleculeCanvas } from "@/components/MoleculeCanvas";
import type { CameraSyncRef } from "@/components/MoleculeCanvas";
import { getMoleculeById } from "@/data/molecules";

/**
 * Camera synchronisation between the two Compare panes. The acceptance
 * criterion is that orbiting, zooming, or panning one pane applies the same
 * camera to the other, so this drives the real `SyncedOrbitControls` logic
 * inside `MoleculeCanvas`.
 *
 * The WebGL canvas cannot run under jsdom, so `@react-three/fiber` is replaced
 * with a stand-in that renders children, hands out a fake camera, and captures
 * each `useFrame` callback so the test can advance a frame explicitly. drei's
 * `OrbitControls` is replaced with a DOM stand-in exposing a real `target`
 * Vector3 and an `update` spy. Everything under test — the publish/apply guard,
 * the version check, and the source check — is the real component code. This is
 * component/integration coverage of the sync contract, not a browser E2E test.
 */

interface FakeCamera {
  position: Vector3;
  lookAt: (x: number, y: number, z: number) => void;
}

interface FakeControls {
  target: Vector3;
  update: ReturnType<typeof vi.fn>;
}

const frameCallbacks: Array<() => void> = [];
const cameras: FakeCamera[] = [];
const controlsRefs: FakeControls[] = [];
let controlsProps: Array<Record<string, unknown>> = [];

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useThree: () => {
    const camera: FakeCamera = {
      position: new Vector3(0, 0, 5),
      lookAt: vi.fn(),
    };
    cameras.push(camera);
    return { camera };
  },
  useFrame: (callback: () => void) => {
    frameCallbacks.push(callback);
  },
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: (props: Record<string, unknown>) => {
    controlsProps.push(props);
    const ref = props.ref as { current: FakeControls | null } | undefined;
    if (ref) {
      const controls: FakeControls = {
        target: new Vector3(0, 0, 0),
        update: vi.fn(),
      };
      ref.current = controls;
      controlsRefs.push(controls);
    }
    return <div data-testid="orbit-controls" />;
  },
}));

const water = getMoleculeById("h2o")!;

function resetHarness() {
  frameCallbacks.length = 0;
  cameras.length = 0;
  controlsRefs.length = 0;
  controlsProps = [];
}

/** Advances every captured frame callback once. */
function advanceFrame() {
  for (const callback of frameCallbacks) callback();
}

describe("MoleculeCanvas camera sync", () => {
  it("publishes a pane's camera move to the shared sync state", () => {
    resetHarness();
    const sync: CameraSyncRef = {
      current: {
        position: [0, 0, 5],
        target: [0, 0, 0],
        version: 0,
        source: "",
      },
    };

    render(
      <MoleculeCanvas
        molecule={water}
        showLonePairs={false}
        showBondAngles={false}
        autoRotate={false}
        resetSignal={0}
        sync={sync}
        syncId="real"
      />,
    );

    // The pane's camera has moved away from the shared state.
    const camera = cameras[0];
    camera.position.set(2, 1, 4);
    const controls = controlsRefs[0];
    controls.target.set(0.5, 0, 0);

    // OrbitControls reports the user interaction through onChange.
    const onChange = controlsProps[0].onChange as () => void;
    onChange();

    expect(sync.current.source).toBe("real");
    expect(sync.current.version).toBe(1);
    expect(sync.current.position).toEqual([2, 1, 4]);
    expect(sync.current.target).toEqual([0.5, 0, 0]);
  });

  it("applies a sibling pane's camera to this pane on the next frame", () => {
    resetHarness();
    const sync: CameraSyncRef = {
      current: {
        position: [0, 0, 5],
        target: [0, 0, 0],
        version: 0,
        source: "",
      },
    };

    render(
      <MoleculeCanvas
        molecule={water}
        showLonePairs={false}
        showBondAngles={false}
        autoRotate={false}
        resetSignal={0}
        sync={sync}
        syncId="ideal"
      />,
    );

    // The other pane published a new camera.
    sync.current = {
      position: [3, 2, 1],
      target: [0.25, -0.5, 0],
      version: 1,
      source: "real",
    };

    advanceFrame();

    const camera = cameras[0];
    expect(camera.position.x).toBeCloseTo(3);
    expect(camera.position.y).toBeCloseTo(2);
    expect(camera.position.z).toBeCloseTo(1);
    const controls = controlsRefs[0];
    expect(controls.target.x).toBeCloseTo(0.25);
    expect(controls.target.y).toBeCloseTo(-0.5);
    expect(controls.target.z).toBeCloseTo(0);
    expect(controls.update).toHaveBeenCalled();
  });

  it("does not echo a camera change back to its own source pane", () => {
    resetHarness();
    const sync: CameraSyncRef = {
      current: {
        position: [0, 0, 5],
        target: [0, 0, 0],
        version: 0,
        source: "",
      },
    };

    render(
      <MoleculeCanvas
        molecule={water}
        showLonePairs={false}
        showBondAngles={false}
        autoRotate={false}
        resetSignal={0}
        sync={sync}
        syncId="real"
      />,
    );

    // A state published by this same pane must not be re-applied to it.
    sync.current = {
      position: [9, 9, 9],
      target: [1, 1, 1],
      version: 1,
      source: "real",
    };

    advanceFrame();

    const camera = cameras[0];
    expect(camera.position.x).toBe(0);
    expect(camera.position.y).toBe(0);
    expect(camera.position.z).toBe(5);
  });

  it("ignores a stale version it has already applied", () => {
    resetHarness();
    const sync: CameraSyncRef = {
      current: {
        position: [0, 0, 5],
        target: [0, 0, 0],
        version: 0,
        source: "",
      },
    };

    render(
      <MoleculeCanvas
        molecule={water}
        showLonePairs={false}
        showBondAngles={false}
        autoRotate={false}
        resetSignal={0}
        sync={sync}
        syncId="ideal"
      />,
    );

    sync.current = {
      position: [3, 0, 0],
      target: [0, 0, 0],
      version: 1,
      source: "real",
    };
    advanceFrame();
    expect(cameras[0].position.x).toBeCloseTo(3);

    // The same version is republished; the pane must not re-apply it.
    cameras[0].position.set(0, 0, 5);
    advanceFrame();
    expect(cameras[0].position.x).toBe(0);
  });
});

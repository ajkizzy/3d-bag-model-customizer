import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }) {
  // drei caches by URL; switching URLs swaps models cleanly
  const gltf = useGLTF(url);

  // Optional: basic material tuning (keeps things consistent)
  React.useEffect(() => {
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;

        // If your Blender materials are good, you can remove this.
        // This just prevents weird shiny defaults.
        const mat = o.material;
        if (mat && mat.isMeshStandardMaterial) {
          mat.metalness = 0.0;
          mat.roughness = Math.min(Math.max(mat.roughness ?? 0.85, 0.6), 1.0);
          mat.needsUpdate = true;
        }
      }
    });
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

export default function App() {
  const [templates, setTemplates] = React.useState([]);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    fetch("/models/templates.json")
      .then((r) => r.json())
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]));
  }, []);

  const current = templates[idx];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", height: "100vh" }}>
      {/* Controls */}
      <div style={{ padding: 20, borderRight: "1px solid #ddd" }}>
        <h2 style={{ margin: 0 }}>Bag configurator</h2>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Template slider swaps pre-made models (fast MVP).
        </p>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Template</strong>
            <span style={{ opacity: 0.7 }}>
              {templates.length ? `${idx + 1}/${templates.length}` : "loading..."}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(templates.length - 1, 0)}
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            style={{ width: "100%" }}
            disabled={!templates.length}
          />

          <div style={{ marginTop: 10, fontSize: 14 }}>
            {current ? <b>{current.name}</b> : <span>Loading templates…</span>}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={!templates.length || idx === 0}
            >
              Prev
            </button>
            <button
              onClick={() => setIdx((v) => Math.min(templates.length - 1, v + 1))}
              disabled={!templates.length || idx === templates.length - 1}
            >
              Next
            </button>
          </div>
        </div>

        <hr style={{ margin: "18px 0" }} />

        <p style={{ fontSize: 13, opacity: 0.7 }}>
          Later upgrades:
          <br />• drag/scale logo
          <br />• front/back toggle
          <br />• morph sliders (stretch)
        </p>
      </div>

      {/* Viewer */}
      <div style={{ background: "#f5f5f5" }}>
        <Canvas shadows camera={{ position: [0, 0.6, 1.8], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 2]} intensity={1.1} castShadow />
          <group position={[0, -0.25, 0]}>
            {current && <Model url={current.url} />}
          </group>
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}

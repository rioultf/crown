// src/App.jsx
import React from "react";
import { useAnimationEngineStatic } from "./hooks/useAnimationEngineStatic";
import CrownWedges from "./components/CrownWedges";

const simpleData = {
  time: [0, 2, 4, 6, 8],
  length: 5,
  tonality: [
    [-5],
 [
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -10,
      -10,
      -10,
      8,
      8,
      8,
      8,
      8,
      8,
      -5,
      -5,
      8,
      8,
      8,
      8,
      8,
      8,
      8,
      8,
      8,
      3,
      3,
      3,
      8,
      8,
      8,
      -5,
      8,
      8,
      8,
      8,
      -5,
      -5,
      -5,
      -12,
      -12,
      -12,
      -12,
      -12,
      -12,
      -12,
      -12,
      -12,
      -12,
      8,
      8,
      8,
      8,
      8,
      -5,
      -5,
      -5,
      -5,
      8,
      8,
      8,
      8,
      -5,
      -5,
      3,
      8,
      8,
      8,
      8,
      8,
      3,
      3,
      -5,
      -5,
      -5,
      -5,
      -5,
      -10,
      -10,
      -10,
      -10,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5,
      -5
    ],
  ]
};

function App() {
  const { configs, currentTime, duration } = useAnimationEngineStatic({
    data: simpleData,
    bpm: 60,
    numCrowns: 5
  });

  return (
    <div>
      <div>Time: {currentTime.toFixed(2)} / {duration.toFixed(2)} s</div>
      <svg width={500} height={500} viewBox="-250 -250 500 500" style={{ background: "#fafafa" }}>
        {configs.map(cfg => (
          <CrownWedges
            key={cfg.crownId}
            id={cfg.crownId}
            motifConfig={cfg}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;

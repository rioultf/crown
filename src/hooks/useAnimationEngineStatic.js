// src/hooks/useAnimationEngineStatic.js
import { useState, useEffect } from "react";
import { setReferenceTonality, distanceToReference } from "../util/tonalDistance.js";

export function useAnimationEngineStatic({ data, bpm = 60, numCrowns = 3 }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [configs, setConfigs] = useState([]);

  const duration = data.time[data.time.length - 1];

  useEffect(() => {
    if (!data) return;
    const refId = data.tonality[0][0];  // premier élément du premier tableau
    setReferenceTonality(refId);
  }, [data]);

  // Timer de lecture simple
  useEffect(() => {
    const startTs = performance.now();
    let rafId = null;

    const tick = (now) => {
      const elapsedSec = (now - startTs) / 1000;
      if (elapsedSec >= duration) {
        setCurrentTime(duration);
        return;
      }
      setCurrentTime(elapsedSec);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [duration]);

  // Calcul des configs à chaque changement de currentTime
  useEffect(() => {
    const { tonality } = data;
    const segments = tonality[tonality.length - 1];  // dernier tableau
    const segCount = segments.length;

    const fraction = currentTime / duration;
    const idx = Math.min(segCount - 1, Math.floor(fraction * segCount));

    const dist  = distanceToReference(segments[idx]);

    const newConfigs = [];
    for (let crownId = 0; crownId < numCrowns; crownId++) {
      newConfigs.push({
        crownId,
        period: crownId,                            // période fixe 8 s
        division: dist + 1, //segments[idx] || 1,
        width: 0.5, // + crownId * 0.1,           // progression d’épaisseur
        phaseShifted: false, //crownId % 2 === 0,
        tonalityId: segments[idx],
        color: null,
        opacity: 1 / (crownId + 1)
      });
    }

    setConfigs(newConfigs);
  }, [currentTime, data, numCrowns, duration]);

  return { configs, currentTime, duration };
}

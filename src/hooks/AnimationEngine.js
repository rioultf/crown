// src/hooks/AnimationEngine.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook : useAnimationEngine
 * - charge les données musicales (format : time[], length, palette, tonality[][])
 * - gère un timer global (play, pause, seek)
 * - calcule périodiquement les motifConfig pour chaque couronne
 *
 * @param {string} dataUrl  – chemin vers le fichier JSON (ex : "/data/BWV_555-2.json")
 * @param {object} options  – { bpm, ticksPerBeat, numCrowns, resolutions: [1,2,4*length], ... }
 * @returns {object}       – { configs: Array<motifConfig>, currentTime, duration, play, pause, seek }
 */
export function useAnimationEngine(dataUrl, options = {}) {
  const {
    bpm             = 120,
    ticksPerBeat    = 480,
    numCrowns       = 3,
    resolutions     = [],       // ex : [1, 2, 4*length]
    onConfigUpdate  = null,     // callback facultatif
  } = options;

  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [configs, setConfigs] = useState([]);

  const timerRef = useRef(null);
  const startTimestampRef = useRef(null);
  const runningRef = useRef(false);

  // 1) Charger les données JSON
  useEffect(() => {
    fetch(dataUrl)
      .then(res  => res.json())
      .then(json => {
        console.log("json", json)
        setData(json);
        // durée estimée : dernier élément de time
        const lastUnit = json.time[json.time.length - 1];
        const secondsPerUnit = (60 / bpm) * (1 / ticksPerBeat);
        setDuration(lastUnit * secondsPerUnit);
      })
      .catch(err => {
        console.error("Erreur chargement données musicales:", err);
      });
  }, [dataUrl, bpm, ticksPerBeat]);

  // 2) Timer de lecture
  const play = useCallback(() => {
    if (!data) return;
    runningRef.current  = true;
    startTimestampRef.current = performance.now() - (currentTime * 1000);
    const tick = () => {
      if (!runningRef.current) return;
      const elapsedMs = performance.now() - startTimestampRef.current;
      const tSec      = elapsedMs / 1000;
      if (tSec >= duration) {
        // fin de lecture
        setCurrentTime(duration);
        runningRef.current = false;
        return;
      }
      setCurrentTime(tSec);
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
  }, [data, currentTime, duration]);

  const pause = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const seek = useCallback((timeSec) => {
    setCurrentTime(timeSec);
    startTimestampRef.current = performance.now() - (timeSec * 1000);
  }, []);

  // 3) Calculer les motifConfig à chaque « tick » (ici on peut le faire quand currentTime change)
  useEffect(() => {
    if (!data) return;
    const { time: timeUnits, length, tonality } = data;

    // convertir currentTime (s) en unité musicale
    const unitsPerSec = ticksPerBeat / (60 / bpm);  // inverse de secondsPerUnit
    const currentUnit = currentTime * unitsPerSec;

    const newConfigs = [];
    for (let crownIndex = 0; crownIndex < numCrowns; crownIndex++) {
      // pour chaque couronne on peut choisir une résolution
      const resIndex = crownIndex < resolutions.length ? resolutions[crownIndex] : resolutions[resolutions.length-1];
      const segments = tonality[resIndex];
      const segmentCount = segments.length;
      // déterminer l’index de segment courant
      const unitPerSegment = length * ticksPerBeat / segmentCount;
      const segIndex = Math.min(segmentCount-1, Math.floor(currentUnit / unitPerSegment));
      const tonId    = segments[segIndex];

      // ex : config basique
      newConfigs.push({
        period:        5 + crownIndex * 2,        // par ex, période qui dépend de l’indice
        division:      segmentCount,
        width:         1 - (crownIndex * 0.2),
        phaseShifted:  (crownIndex % 2) === 0,
        color:         null,                      // couleur gérée dans CrownWedges selon motifConfig.color ou état palette
        opacity:       1,
        tonalityId:    tonId,
        crownId:       crownIndex,
      });
    }

    setConfigs(newConfigs);
    if (onConfigUpdate) {
      onConfigUpdate(newConfigs);
    }
  }, [currentTime, data, bpm, ticksPerBeat, numCrowns, resolutions]);

  // 4) Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  return { configs, currentTime, duration, play, pause, seek };
}

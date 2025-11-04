// src/components/CrownWedges.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function CrownWedges({ id, motifConfig = {} }) {
  const groupRef = useRef(null);

  const {
    period       = 8,
    division     = 1,
    width        = 0.5,
    phaseShifted = false,
    color        = "black",
    opacity      = 1
  } = motifConfig;

  // rotation continue via GSAP
  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.to(groupRef.current, {
        rotation: 360,
        duration: period,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%"
      });
    }, groupRef);
    return () => ctx.revert();
  }, [period]);

  // transition visuelle sur changement de division/width
  useEffect(() => {
    if (!groupRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        groupRef.current,
        { scale: 1 },
        { scale: 1, duration: 0.4, ease: "power2.out" }
      );
      // mise à jour de l’opacité et couleur
      gsap.to(groupRef.current, { opacity, duration: 0.3 });
    }, groupRef);
    return () => ctx.revert();
  }, [division, width, opacity, color]);

  // géométrie
  const innerRadius = 40 * id;
  const outerRadius = innerRadius + 40;
  const sectorAngle = (2 * Math.PI) / Math.max(1, division);
  const half = (sectorAngle * width) / 2;
  const phaseOffset = phaseShifted ? Math.PI / Math.max(1, division) : 0;
  const toXY = (r, a) => ({
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  });

  const bars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < division; i++) {
      const center = i * sectorAngle;
      const a1 = center - half + phaseOffset;
      const a2 = center + half + phaseOffset;

      const A = toXY(innerRadius, a1);
      const B = toXY(outerRadius, a1);
      const C = toXY(outerRadius, a2);
      const D = toXY(innerRadius, a2);

      const delta = a2 - a1;
      const largeArcFlag = delta > Math.PI ? 1 : 0;

      let d;
      if (innerRadius === 0) {
        const P1 = toXY(outerRadius, a1);
        const P2 = toXY(outerRadius, a2);
        d = `M 0 0 L ${P1.x} ${P1.y} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${P2.x} ${P2.y} Z`;
      } else {
        d = `M ${A.x} ${A.y} L ${B.x} ${B.y} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${C.x} ${C.y} L ${D.x} ${D.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${A.x} ${A.y} Z`;
      }

      arr.push(
        <path key={i} d={d} fill={color} fillOpacity={opacity} stroke="none" />
      );
    }
    return arr;
  }, [division, width, color, opacity, innerRadius, outerRadius, phaseOffset]);

  //transformOrigin="0% 0%"
  // éloigne le centre
  return (
    <g
      ref={groupRef}
      style={{ pointerEvents: "none" }}
    >
      <circle
        cx={0}
        cy={0}
        r={outerRadius}
        fill="none"
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity * 0.5}
      />
      {bars}
    </g>
  );
}

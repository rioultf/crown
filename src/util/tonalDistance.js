// tonalDistance.js

// 1. Génération du cycle des quintes (12 positions)
const quintCycle = (() => {
  let inc = 0;
  return Array(12).fill(1).map(() => {
    inc += 7;
    return (inc - 7) % 12;
  });
})();
// e.g. [0,7,2,9,4,11,6,1,8,3,10,5]

// 2. Construction du mapping id → position sur le cycle
const idToPos = {};
for (let i = 0; i < 12; i++) {
  const majorId = i + 1;      // 1 à 12 pour majeures
  idToPos[ majorId ] = quintCycle[i];
  // Pour mineures (-1 à -12) : on mappe à “relative majeure” en +3 positions
  idToPos[ -majorId ] = quintCycle[(i + 3) % 12];
}

// 3. Tonalité de référence (modifiable)
let referenceTonality = null;

// Fonction pour fixer la référence
function setReferenceTonality(refId) {
  if (!idToPos.hasOwnProperty(refId)) {
    throw new Error(`Tonalité de référence non reconnue : ${refId}`);
  }
  referenceTonality = refId;
}

// Fonction pour obtenir la position dans le cycle d’une tonalité
function tonalityToPos(t) {
  if (idToPos.hasOwnProperty(t)) {
    return idToPos[t];
  }
  return null;
}

// Fonction pour calculer la distance entre deux tonalités (en positions du cycle)
function tonalDistanceBetween(refId, targetId) {
  const posRef = tonalityToPos(refId);
  const posT   = tonalityToPos(targetId);
  if (posRef === null || posT === null) {
    return null;
  }
  const total = 12;
  const diff  = Math.abs(posRef - posT);
  return Math.min(diff, total - diff);
}

// Fonction « publique » : distance de la tonalité cible à la référence fixée
function distanceToReference(targetId) {
  if (referenceTonality === null) {
    throw new Error("Référence de tonalité non fixée. Veuillez appeler setReferenceTonality().");
  }
  return tonalDistanceBetween(referenceTonality, targetId);
}

// Export
export {
  setReferenceTonality,
  distanceToReference,
  tonalDistanceBetween,
  tonalityToPos,
  quintCycle,
  idToPos
};

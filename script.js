async function fetchFarmData() {
  const response = await fetch("farm_data.json");
  const data = await response.json();
  return data;
}

function getInitialLevels() {
  return {
    carrot: parseInt(document.getElementById("carrot_level").value, 10),
    garlic: parseInt(document.getElementById("garlic_level").value, 10),
    potato: parseInt(document.getElementById("potato_level").value, 10),
    chili: parseInt(document.getElementById("chili_level").value, 10),
    strawberry: parseInt(document.getElementById("strawberry_level").value, 10),
  };
}

function getInitialGarlicCount() {
  return parseInt(document.getElementById("garlic_count").value, 10) || 0;
}

function getFieldPoints() {
  return parseInt(document.getElementById("field_points").value, 10) || 0;
}

function roundDown(value) {
  return Math.floor(value);
}

async function processTurns(baseLevels) {
  const farmData = await fetchFarmData();
  const initialGarlicCount = getInitialGarlicCount();
  const initialFieldPoints = getFieldPoints();

  let garlicLevels = [...baseLevels];
  let garlicCounts = [initialGarlicCount];
  let currentFieldPoints = initialFieldPoints;

  for (let n = 1; n <= 14; n++) {
    let currentLevel = garlicLevels[n - 1];

    let baseYield = farmData["畑レベル毎の基礎収穫量"][currentLevel];
    let garlicYield = 0;

    if (n === 4 || n === 8) {
      garlicYield = roundDown(baseYield * 1.6);
    } else if (n >= 9 && n < 14) {
      garlicYield = roundDown(roundDown(baseYield / 2) * 1.5);
    }

    let newGarlicCount;
    if (n >= 9 && n < 14) {
      newGarlicCount = garlicCounts[n - 1] - 80 + garlicYield;
    } else if (n === 14) {
      newGarlicCount = garlicCounts[n - 1] - 80;
    } else {
      newGarlicCount = garlicCounts[n - 1] + garlicYield;
    }

    const maxGarlicCount = farmData["畑レベル毎の所持上限"][currentLevel];
    newGarlicCount = Math.min(newGarlicCount, maxGarlicCount);
    garlicCounts.push(newGarlicCount);
  }

  console.log(garlicLevels, garlicCounts);

  const negativeTurnIndex = garlicCounts.findIndex((count) => count < 0);

  if (negativeTurnIndex !== -1) {
    let adjustmentIndex = negativeTurnIndex - 1;
    let newBaseLevels = [...baseLevels];

    for (let i = adjustmentIndex; i < 14; i++) {
      newBaseLevels[i]++;
    }

    const result = await processTurns(newBaseLevels);
    if (result.negative) {
      for (let i = adjustmentIndex - 1; i >= 0; i--) {
        newBaseLevels = [...baseLevels];
        for (let j = i; j < 14; j++) {
          newBaseLevels[j]++;
        }
        const result = await processTurns(newBaseLevels);
        if (!result.negative) {
          return result;
        }
      }
      console.log("これ以上レベルアップできるターンがありません。");
    } else {
      return result;
    }
  } else {
    console.log("計算終了");
    return { negative: false, garlicLevels, garlicCounts };
  }
}

document
  .getElementById("resourceForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const initialLevels = getInitialLevels();
    const baseLevels = Array(14).fill(initialLevels.garlic);

    const result = await processTurns(baseLevels);
    console.log(result.garlicLevels, result.garlicCounts);
  });

async function fetchFarmData() {
  const response = await fetch("farm_data.json");
  return await response.json();
}

async function calculateFarmLevels() {
  const data = await fetchFarmData();

  // ユーザーの入力を取得
  const initialFarmPoints = parseInt(
    document.getElementById("field_points").value,
    10
  );
  const levels = {
    carrot: parseInt(document.getElementById("carrot_level").value, 10),
    garlic: parseInt(document.getElementById("garlic_level").value, 10),
    potato: parseInt(document.getElementById("potato_level").value, 10),
    chili: parseInt(document.getElementById("chili_level").value, 10),
    strawberry: parseInt(document.getElementById("strawberry_level").value, 10),
  };

  const farmNames = ["carrot", "garlic", "potato", "chili", "strawberry"];
  const farmOrderings = permute(farmNames);
  const uniqueResults = new Set();

  // 全ての並び順でループ
  for (const order of farmOrderings) {
    let currentLevels = { ...levels };
    let currentPoints = initialFarmPoints;
    let log = [];

    // 各畑を処理
    for (const farm of order) {
      let neededPoints = 0;

      while (true) {
        const currentLevel = currentLevels[farm];
        const nextLevel = currentLevel + 1;

        // ニンニクでLv2以上、または他の畑でLv5の場合は次の畑へ
        if (
          (farm === "garlic" && currentLevel >= 2) ||
          (farm !== "garlic" && currentLevel >= 5)
        ) {
          break;
        }

        // レベルアップに必要なポイントを取得
        const pointsToLevelUp =
          data["畑レベルを上げるのに必要な畑ポイント"][
            `${currentLevel}→${nextLevel}`
          ];
        neededPoints += pointsToLevelUp;

        if (
          neededPoints <= initialFarmPoints &&
          [1, 2, 4].includes(currentLevel)
        ) {
          currentPoints -= pointsToLevelUp;
          currentLevels[farm] = nextLevel;
          neededPoints = 0;

          // レベルアップログ
          log.push({ level: nextLevel, points: currentPoints });

          // レベル3の場合は次の畑の処理へ
          if (currentLevel === 3) {
            break;
          }
        } else if (neededPoints > initialFarmPoints) {
          break;
        }
      }
    }

    // 結果をユニークに保持
    const result = JSON.stringify({
      levels: currentLevels,
      points: currentPoints,
    });
    uniqueResults.add(result);
  }

  // ユニークな結果をログに出力
  for (const result of uniqueResults) {
    console.log(JSON.parse(result));
  }
}

// 全ての並び順を生成するヘルパー関数
function permute(arr) {
  let result = [];

  function permuteInner(arr, m = []) {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permuteInner(curr.slice(), m.concat(next));
      }
    }
  }

  permuteInner(arr);
  return result;
}

// 送信ボタンが押されたときに計算を実行
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  calculateFarmLevels();
});

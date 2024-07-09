async function fetchFarmData() {
  // farm_data.jsonファイルからデータを取得する
  const response = await fetch("farm_data.json");
  // 取得したデータをJSON形式に変換する
  const data = await response.json();
  // データを返す
  return data;
}

function getInitialLevels() {
  // 各作物の初期レベルを取得して数値に変換する
  return {
    carrot: parseInt(document.getElementById("carrot_level").value, 10),
    garlic: parseInt(document.getElementById("garlic_level").value, 10),
    potato: parseInt(document.getElementById("potato_level").value, 10),
    chili: parseInt(document.getElementById("chili_level").value, 10),
    strawberry: parseInt(document.getElementById("strawberry_level").value, 10),
  };
}

function getInitialFoodCount(food) {
  // 食品の初期数を取得して数値に変換する。値がない場合は0にする
  return parseInt(document.getElementById(food + "_count").value, 10) || 0;
}

function getFieldPoints() {
  // 畑のポイントを取得して数値に変換する。値がない場合は0にする
  return parseInt(document.getElementById("field_points").value, 10) || 0;
}

function roundDown(value) {
  // 小数点以下を切り捨てる
  return Math.floor(value);
}

let indexCount = 0;
// フォームが送信されたときの処理を追加する
document
  .getElementById("resourceForm")
  .addEventListener("submit", async (event) => {
    // フォームの送信をキャンセルする
    event.preventDefault();

    // 各作物の初期レベルを取得する
    const initialLevels = getInitialLevels();
    // 初期レベルのリストを作成する
    let baseLevels = Array(14).fill(initialLevels.garlic);

    // 畑の初期ポイントを取得する
    const initialFieldPoints = getFieldPoints();

    // ターンを処理する
    let turnCount = 0;
    let currentLevelIncrease = 1;
    let levelIncrement = 1;
    let result = await processTurns(baseLevels, turnCount, "garlic");
    let lastResult = [];

    while (true) {
      if (!result.garlicCounts.some((count) => count < 0)) {
        // 負の値が含まれていない場合の処理
        console.log("All garlic counts are non-negative.");
        // 現在の結果をlastResultに追加する
        lastResult.push({
          garlicLevels: result.garlicLevels,
          garlicCounts: result.garlicCounts,
          levelIncrement: levelIncrement,
          fieldPoints: [],
          carrotLevels: Array(14).fill(initialLevels.carrot),
          potatoLevels: Array(14).fill(initialLevels.potato),
          chiliLevels: Array(14).fill(initialLevels.chili),
          strawberryLevels: Array(14).fill(initialLevels.strawberry),
        });
        if (currentLevelIncrease === 1) {
          break;
        } else {
          currentLevelIncrease = 1; // nを1に戻す
          levelIncrement += 1; // mを増やす
          console.log(`レベルを ${levelIncrement} 上げます`);
          // level + mが5以上になるか確認する
          if (baseLevels.some((level) => level + levelIncrement >= 5)) {
            console.log("レベル + m が 5 以上になりました。処理を終了します。");
            break;
          }
          // 初期値を確認するために初期値に更新する
          result = await processTurns(baseLevels, turnCount, "garlic");
          const negativeIndex = result.garlicCounts.findIndex(
            (count) => count < 0
          );
          const index = negativeIndex;
          // レベルをm上げる処理
          let newBaseLevels = baseLevels.map((level, i) =>
            i >= index - currentLevelIncrease ? level + levelIncrement : level
          );

          // 再度 processTurns を実行する
          result = await processTurns(newBaseLevels, turnCount, "garlic");
          currentLevelIncrease += 1;
        }
      } else {
        // 負の値が含まれている場合の処理
        const negativeIndex = result.garlicCounts.findIndex(
          (count) => count < 0
        );
        const index = negativeIndex;
        console.log(index);
        console.log(index - currentLevelIncrease);

        if (index - currentLevelIncrease < 0) {
          currentLevelIncrease = 1; // nを1に戻す
          levelIncrement += 1; // mを増やす
          console.log(`レベルを ${levelIncrement} 上げます`);
        }

        // level + mが5以上になるか確認する
        if (baseLevels.some((level) => level + levelIncrement >= 5)) {
          console.log("レベル + m が 5 以上になりました。処理を終了します。");
          break;
        }

        // レベルをm上げる処理
        let newBaseLevels = baseLevels.map((level, i) =>
          i >= index - currentLevelIncrease ? level + levelIncrement : level
        );

        // 再度 processTurns を実行する
        result = await processTurns(newBaseLevels, turnCount, "garlic");
        currentLevelIncrease += 1;
      }
    }

    // 結果を出力する
    console.log(lastResult);

    // 追加の処理
    let resultIndex = 0;
    while (resultIndex < lastResult.length) {
      let levels = [...lastResult[resultIndex]["garlicLevels"]];
      for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex++) {
        let indexDifference = levels[levelIndex] - levels[levelIndex + 1];
        if (indexDifference !== 0) {
          levels[levelIndex + 1] -= 1;
          garlicresult = await processTurns(levels, turnCount, "garlic");

          carrotresult = await processTurns(
            lastResult[resultIndex].carrotLevels,
            turnCount,
            "carrot"
          );
          potatoresult = await processTurns(
            lastResult[resultIndex].potatoLevels,
            turnCount,
            "potato"
          );
          chiliresult = await processTurns(
            lastResult[resultIndex].chiliLevels,
            turnCount,
            "chili"
          );
          strawberryresult = await processTurns(
            lastResult[resultIndex].strawberryLevels,
            turnCount,
            "strawberry"
          );
          // result.garlicCountsに一つも負の値がなければ
          if (!garlicresult.garlicCounts.some((count) => count < 0)) {
            // lastResult[resultIndex]に値を上書きする
            lastResult[resultIndex] = {
              garlicLevels: garlicresult.garlicLevels,
              garlicCounts: garlicresult.garlicCounts,
              fieldPoints: lastResult[resultIndex].fieldPoints,
              carrotLevels: lastResult[resultIndex].carrotLevels,
              carrotCounts: carrotresult.garlicCounts,
              potatoLevels: lastResult[resultIndex].potatoLevels,
              potatoCounts: potatoresult.garlicCounts,
              chiliLevels: lastResult[resultIndex].chiliLevels,
              chiliCounts: chiliresult.garlicCounts,
              strawberryLevels: lastResult[resultIndex].strawberryLevels,
              strawberryCounts: strawberryresult.garlicCounts,
            };
          } else {
            // result.garlicCountsにマイナスの値がある場合はループから抜ける
            lastResult[resultIndex] = {
              garlicLevels: lastResult[resultIndex].garlicLevels,
              garlicCounts: lastResult[resultIndex].garlicCounts,
              fieldPoints: lastResult[resultIndex].fieldPoints,
              carrotLevels: lastResult[resultIndex].carrotLevels,
              carrotCounts: carrotresult.garlicCounts,
              potatoLevels: lastResult[resultIndex].potatoLevels,
              potatoCounts: potatoresult.garlicCounts,
              chiliLevels: lastResult[resultIndex].chiliLevels,
              chiliCounts: chiliresult.garlicCounts,
              strawberryLevels: lastResult[resultIndex].strawberryLevels,
              strawberryCounts: strawberryresult.garlicCounts,
            };
            break;
          }
        }
      }

      console.log(`Updated levels for result `, lastResult);

      resultIndex++;
    }

    // lastResultにポイントの情報を付与
    const levelUpPoints = {
      "1→2": 100,
      "2→3": 180,
      "3→4": 220,
      "4→5": 250,
    };

    lastResult.forEach((result) => {
      const points = [];
      points[0] = initialFieldPoints;
      for (let i = 1; i <= 3; i++) {
        points[i] = points[i - 1];
      }
      points[4] = points[3] + 160;
      for (let i = 5; i <= 7; i++) {
        points[i] = points[i - 1];
      }
      points[8] = points[7] + 160;
      for (let i = 9; i <= 13; i++) {
        points[i] = points[i - 1] + 75;
      }

      result.fieldPoints = points;

      // 畑レベルの変化によるポイントの減算
      for (let i = 0; i < result.garlicLevels.length - 1; i++) {
        if (result.garlicLevels[i] !== result.garlicLevels[i + 1]) {
          let levelDiff = result.garlicLevels[i + 1] - result.garlicLevels[i];
          let pointsToDeduct = 0;

          if (levelDiff > 0) {
            for (
              let level = result.garlicLevels[i];
              level < result.garlicLevels[i + 1];
              level++
            ) {
              let nextLevelKey = `${level}→${level + 1}`;
              pointsToDeduct += levelUpPoints[nextLevelKey];
            }
            for (let j = i + 1; j < points.length; j++) {
              points[j] -= pointsToDeduct;
            }
          }
        }
      }
    });

    console.log("Final results with field points:", lastResult);

    // 作物の初期レベルが4のものを抽出する
    const cropsWithLevelFour = Object.entries(initialLevels)
      .filter(([crop, level]) => level === 4)
      .map(([crop]) => crop);

    console.log("初期レベルが4の作物:", cropsWithLevelFour);
    // 各 resultIndex をループして処理する
    lastResult.forEach(async (result, resultIndex) => {
      console.log(
        `resultIndex ${resultIndex} の fieldPoints:`,
        result.fieldPoints
      );

      // レベル4の作物が1つ存在する場合
      if (cropsWithLevelFour.length === 1) {
        // インデックスの大きい方から数えて、最初に250未満になったインデックス+1を探す
        const lastIndexUnder250 = result.fieldPoints
          .slice()
          .reverse()
          .findIndex((point) => point < 250);
        const adjustedIndex = result.fieldPoints.length - lastIndexUnder250;

        if (lastIndexUnder250 !== -1) {
          console.log(
            `resultIndex ${resultIndex} の 250未満になったインデックス+1:`,
            adjustedIndex
          );

          // 作物のレベルを上げる
          const crop = cropsWithLevelFour[0];
          for (let i = adjustedIndex; i < result.fieldPoints.length; i++) {
            result[`${crop}Levels`][i] += 1;
          }

          // インデックス以上のfieldPointsを250引く
          for (let i = adjustedIndex; i < result.fieldPoints.length; i++) {
            result.fieldPoints[i] -= 250;
          }

          // 更新したレベルで processTurns を実行
          const updatedResult = await processTurns(
            result[`${crop}Levels`],
            turnCount,
            crop
          );

          // 結果をlastResultの特定の配列に上書き
          result[`${crop}Levels`] = updatedResult.garlicLevels;
          result[`${crop}Counts`] = updatedResult.garlicCounts;
          console.log(`Updated result for ${crop}:`, lastResult);
        }
      }

      // レベル4の作物が2つ存在する場合
      if (cropsWithLevelFour.length === 2) {
        const firstIndexOver250 = result.fieldPoints.findIndex(
          (point) => point > 250
        );
        const firstIndexOver500 = result.fieldPoints.findIndex(
          (point) => point > 500
        );
        if (firstIndexOver250 !== -1) {
          console.log(
            `resultIndex ${resultIndex} の 250を最初に超えたインデックス:`,
            firstIndexOver250
          );
        }
        if (firstIndexOver500 !== -1) {
          console.log(
            `resultIndex ${resultIndex} の 500を最初に超えたインデックス:`,
            firstIndexOver500
          );
        }
      }
    });
  });

async function processTurns(baseLevels, turnCount, food) {
  console.log(turnCount);
  // 畑のデータを取得する
  const farmData = await fetchFarmData();
  // ニンニクの初期数を取得する
  const initialGarlicCount = getInitialFoodCount(food);
  // 畑の初期ポイントを取得する
  const initialFieldPoints = getFieldPoints();
  // 各ターンのニンニクのレベルを保存するリストを作成する

  let garlicLevels;

  garlicLevels = [...baseLevels];

  // 各ターンのニンニクの数を保存するリストを作成する
  let garlicCounts = [initialGarlicCount];
  // 現在の畑のポイントを保存する変数
  let currentFieldPoints = initialFieldPoints;

  // 14ターン分の処理を行う
  for (let turn = 1; turn <= 14; turn++) {
    // 現在のターンのニンニクのレベルを取得する
    let currentLevel = garlicLevels[turn - 1];

    // 現在のレベルに応じた基礎収穫量を取得する
    let baseYield = farmData["畑レベル毎の基礎収穫量"][currentLevel];
    // ニンニクの収穫量を初期化する
    let garlicYield = 0;

    // 4ターン目と8ターン目の場合、収穫量を1.6倍にする
    if (turn === 4 || turn === 8) {
      garlicYield = roundDown(baseYield * 1.6);
      // 9ターン目から13ターン目の場合、収穫量を1.5倍にする
    } else if (turn >= 9 && turn < 14) {
      garlicYield = roundDown(roundDown(baseYield / 2) * 1.5);
    }

    // 収穫後のニンニクの数を計算する
    let newGarlicCount;
    // 9ターン目から13ターン目の場合、80個減らして収穫を追加する
    if (turn >= 9 && turn < 14) {
      newGarlicCount = garlicCounts[turn - 1] - 80 + garlicYield;
      // 14ターン目の場合、80個減らす
    } else if (turn === 14) {
      newGarlicCount = garlicCounts[turn - 1] - 80;
      // その他のターンの場合、収穫を追加する
    } else {
      newGarlicCount = garlicCounts[turn - 1] + garlicYield;
    }

    // 現在のレベルで持てるニンニクの最大数を取得する
    const maxGarlicCount = farmData["畑レベル毎の所持上限"][currentLevel];
    // ニンニクの数が最大数を超えないようにする
    newGarlicCount = Math.min(newGarlicCount, maxGarlicCount);
    // 新しいニンニクの数をリストに追加する
    garlicCounts.push(newGarlicCount);
  }

  // ニンニクのレベルと数を出力する
  console.log(garlicLevels, garlicCounts);
  return { garlicLevels, garlicCounts };
}

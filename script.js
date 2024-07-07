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

function getInitialGarlicCount() {
  // ニンニクの初期数を取得して数値に変換する。値がない場合は0にする
  return parseInt(document.getElementById("garlic_count").value, 10) || 0;
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

    // ターンを処理する
    let indexCount = 0;
    let n = 1;
    let m = 1;
    let result = await processTurns(baseLevels, indexCount);
    let lastResult = [];

    while (true) {
      if (!result.garlicCounts.some((count) => count < 0)) {
        // 負の値が含まれていない場合の処理
        console.log("All garlic counts are non-negative.");
        // 現在の結果をlastResultに追加する
        lastResult.push({
          garlicLevels: result.garlicLevels,
          garlicCounts: result.garlicCounts,
          m: m,
        });

        if (n === 1) {
          break;
        } else {
          n = 1; // nを1に戻す
          m += 1; // mを増やす
          console.log(`レベルを ${m} 上げます`);
          // level + mが6以上になるか確認する
          if (baseLevels.some((level) => level + m >= 6)) {
            console.log("レベル + m が 6 以上になりました。処理を終了します。");
            break;
          }
          //初期値を確認するために初期値に更新する
          result = await processTurns(baseLevels, indexCount);
          const negativeIndex = result.garlicCounts.findIndex(
            (count) => count < 0
          );
          const index = negativeIndex;
          // レベルをm上げる処理
          let newBaseLevels = baseLevels.map((level, i) =>
            i >= index - n ? level + m : level
          );

          // 再度 processTurns を実行する
          result = await processTurns(newBaseLevels, indexCount);
          n += 1;
        }
      } else {
        // 負の値が含まれている場合の処理
        const negativeIndex = result.garlicCounts.findIndex(
          (count) => count < 0
        );
        const index = negativeIndex;
        console.log(index);
        console.log(index - n);

        if (index - n < 0) {
          n = 1; // nを1に戻す
          m += 1; // mを増やす
          console.log(`レベルを ${m} 上げます`);
        }

        // level + mが6以上になるか確認する
        if (baseLevels.some((level) => level + m >= 6)) {
          console.log("レベル + m が 6 以上になりました。処理を終了します。");
          break;
        }

        // レベルをm上げる処理
        let newBaseLevels = baseLevels.map((level, i) =>
          i >= index - n ? level + m : level
        );

        // 再度 processTurns を実行する
        result = await processTurns(newBaseLevels, indexCount);
        n += 1;
      }
    }
    // 結果を出力する
    console.log(lastResult[0]["garlicCounts"]);
  });

async function processTurns(baseLevels, indexCount) {
  // 畑のデータを取得する
  const farmData = await fetchFarmData();
  // ニンニクの初期数を取得する
  const initialGarlicCount = getInitialGarlicCount();
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
  for (let n = 1; n <= 14; n++) {
    // 現在のターンのニンニクのレベルを取得する
    let currentLevel = garlicLevels[n - 1];

    // 現在のレベルに応じた基礎収穫量を取得する
    let baseYield = farmData["畑レベル毎の基礎収穫量"][currentLevel];
    // ニンニクの収穫量を初期化する
    let garlicYield = 0;

    // 4ターン目と8ターン目の場合、収穫量を1.6倍にする
    if (n === 4 || n === 8) {
      garlicYield = roundDown(baseYield * 1.6);
      // 9ターン目から13ターン目の場合、収穫量を1.5倍にする
    } else if (n >= 9 && n < 14) {
      garlicYield = roundDown(roundDown(baseYield / 2) * 1.5);
    }

    // 収穫後のニンニクの数を計算する
    let newGarlicCount;
    // 9ターン目から13ターン目の場合、80個減らして収穫を追加する
    if (n >= 9 && n < 14) {
      newGarlicCount = garlicCounts[n - 1] - 80 + garlicYield;
      // 14ターン目の場合、80個減らす
    } else if (n === 14) {
      newGarlicCount = garlicCounts[n - 1] - 80;
      // その他のターンの場合、収穫を追加する
    } else {
      newGarlicCount = garlicCounts[n - 1] + garlicYield;
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

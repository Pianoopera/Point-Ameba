
/** Name：Point Amoeba */

figma.showUI(__html__);

let timer: any = undefined;

figma.ui.onmessage = message => {
  // console.log('message', message);
  // プラグインの実行時に上記の関数を呼び出す
  extractTextFromSelectedStickyNotes();
  if (message.quit) {
    figma.closePlugin();
  }
}

// 選択されたノードをチェックし、条件に合致するテキストを抽出する関数
function extractTextFromSelectedStickyNotes() {
  // 選択されたノードを取得
  const selectedNodes = figma.currentPage.selection;

  // 抽出したテキストを格納する配列
  const extractedTexts: string[] = [];

  // 色ごとの合計ポイントを格納するオブジェクト
  const totalsByColorList: { [color: string]: number } = {};

  // 選択されたノードをループして処理
  selectedNodes.forEach((node) => {
    // ノードがSticky Noteかどうかをチェック
    if (node.type === 'STICKY') {

      // テキストノードを取得
      const textNode = node.text;
      // 背景色を取得
      const backgroundColor: any = node.fills;
      // console.log('backgroundColor', backgroundColor);
      // console.log('backgroundColor', backgroundColor[0].color.b);

      const colorKey = `rgb(${Math.round(backgroundColor[0].color.r * 255)}, ${Math.round(backgroundColor[0].color.g * 255)}, ${Math.round(backgroundColor[0].color.b * 255)})`;


      // テキストノードが存在するかチェック
      if (textNode) {
        // テキストからカッコ[]で囲まれた部分をすべて抽出
        const regex = /\[(.*?)\]/g;
        let match;
        while ((match = regex.exec(textNode.characters)) !== null) {
          // 全角の数字を半角に変換
          match[1] = match[1].replace(/[０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
          });
          // 抽出したテキストに数値が含まれているかチェック
          // & 小数点も考慮する
          if (/\d+(.\d+)?/.test(match[1])) {
            // 数値のみ抽出
            const number = match[1].match(/\d+(.\d+)?/);
            // 条件に合致するテキストを配列に追加
            if (number) {
              // console.log('number', number);
              extractedTexts.push(number[0]);

              if (!totalsByColorList[colorKey]) {
                totalsByColorList[colorKey] = 0;
              }
              // 端数対応
              totalsByColorList[colorKey] += Number(number[0]);
            }
          }
        }
      }
    }
  });

  // console.log(extractedTexts);
  // console.log(totalsByColorList);

  // 抽出したポイントを合算する
  const totalPoints = extractedTexts.reduce((acc, cur) => acc + Number(cur), 0);
  // console.log('totalPoints', totalPoints);

  // FigmaのUIに結果を表示（必要に応じて）
  figma.ui.postMessage({ totalPoints, totalsByColorList });
}
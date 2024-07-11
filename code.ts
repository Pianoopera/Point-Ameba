
/** Name：Point Amoeba */

figma.showUI(__html__);

let timer: any = undefined;

figma.ui.onmessage = message => {
  extractTextFromSelectedStickyNotes();
  if (message.quit) {
    figma.closePlugin();
  }
}

function extractTextFromSelectedStickyNotes() {
  /** given */
  const selectedNodes = figma.currentPage.selection;
  const extractedTexts: string[] = [];
  const totalsByColorList: { [color: string]: number } = {};

  function traverseAndExtract(node: SceneNode) {
    /** when */
    if (node.type === 'STICKY') {
      const textNode = node.text;
      const backgroundColor: any = node.fills;
      const colorKey = `rgb(${Math.round(backgroundColor[0].color.r * 255)}, ${Math.round(backgroundColor[0].color.g * 255)}, ${Math.round(backgroundColor[0].color.b * 255)})`;

      if (textNode) {
        const regex = /\[(.*?)\]/g;
        let match;
        while ((match = regex.exec(textNode.characters)) !== null) {
          // 全角の数字を半角に変換
          match[1] = match[1].replace(/[０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
          });
          // 抽出したテキストに数値が含まれているかチェック & 小数点も考慮する
          if (/\d+(.\d+)?/.test(match[1])) {
            // 数値のみ抽出
            const number = match[1].match(/\d+(.\d+)?/);
            // 条件に合致するテキストを配列に追加
            if (number) {
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
    } else if (node.type === 'SECTION' || node.type === 'GROUP') {
      node.children.forEach(traverseAndExtract);
    }
  }

  // 選択されたノードをループして処理
  selectedNodes.forEach(traverseAndExtract);

  // 抽出したポイントを合算する
  const totalPoints = extractedTexts.reduce((acc, cur) => acc + Number(cur), 0);

  // FigmaのUIに結果を表示
  figma.ui.postMessage({ totalPoints, totalsByColorList });
  figma.ui.resize(300, 50 * Object.keys(totalsByColorList).length + 150);

  // reset
  extractedTexts.length = 0;
}
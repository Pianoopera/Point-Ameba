
figma.showUI(__html__);

let timer: any = undefined;

figma.ui.onmessage = message => {
  console.log('message', message);
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

  // 選択されたノードをループして処理
  selectedNodes.forEach((node) => {
    // ノードがSticky Noteかどうかをチェック
    if (node.type === 'STICKY') {

      // テキストノードを取得
      const textNode = node.text;

      // テキストノードが存在するかチェック
      if (textNode) {
        // テキストからカッコ[]で囲まれた部分をすべて抽出
        const regex = /\[(.*?)\]/g;
        let match;
        while ((match = regex.exec(textNode.characters)) !== null) {
          // 抽出したテキストに数値が含まれているかチェック
          if (/\d+/.test(match[1])) {
            // 数値のみ抽出
            const number = match[1].match(/\d+/);
            // 条件に合致するテキストを配列に追加
            if (number) {
              extractedTexts.push(number[0]);
            }
          }
        }
      }
    }
  });

  // 抽出したテキストをコンソールに出力（または後続の処理で利用）
  console.log(extractedTexts);

  // 抽出したポイントを合算する
  const totalPoints = extractedTexts.reduce((acc, cur) => acc + Number(cur), 0);
  console.log('totalPoints', totalPoints);

  // FigmaのUIに結果を表示（必要に応じて）
  figma.ui.postMessage({ query: 'totalPoints', totalPoints });
}
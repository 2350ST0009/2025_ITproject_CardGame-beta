const gameBoard = document.getElementById('game-board');
let board = [];
let reserve = [];
let selectedCards = null;
let selectedColumnIndex = null;
let completedSets = 0;
const columns = 10;

async function initializeGame() {
  const response = await fetch('https://deckofcardsapi.com/api/deck/new/draw/?count=52');
  const data = await response.json();

  // APIから返されたcardsの内容を表示
  console.log('APIから取得したカード:', data.cards);
  
  const allSpades = data.cards.filter(c => c.suit === 'SPADES');
  console.log('スペードカード:', allSpades);

  if (allSpades.length !== 13) {
    alert('スペードが13枚取得できませんでした。');
    return;
  }

  let spadesDeck = [];
  for (let i = 0; i < 8; i++) {
    spadesDeck = spadesDeck.concat(allSpades.map(c => ({ ...c })));
  }
  shuffle(spadesDeck);

  setupBoard(spadesDeck.slice(0, 54));
  reserve = spadesDeck.slice(54);
}





function setupBoard(cards) {
  gameBoard.innerHTML = '';
  board = [];

  for (let i = 0; i < columns; i++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'column';
    const colCards = [];
    let count = i < 4 ? 6 : 5;

    for (let j = 0; j < count; j++) {
      const card = cards.pop();
      card.faceUp = j === count - 1;
      colCards.push(card);
    }

    board.push(colCards);
    gameBoard.appendChild(colDiv);
  }
  renderBoard();
}

function renderBoard() {
  gameBoard.innerHTML = '';  // ゲームボードをリセット

  for (let i = 0; i < columns; i++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'column';
    colDiv.dataset.index = i;
    const col = board[i];

    col.forEach((card, j) => {
      const img = document.createElement('img');
      img.src = card.faceUp ? card.image : 'https://deckofcardsapi.com/static/img/back.png';
      img.className = 'card';
      img.style.top = `${j * 20}px`;
      img.dataset.code = card.code;
      img.dataset.index = j;
      colDiv.appendChild(img);

      // クリックされたカードだけに選択クラスを適用
      if (selectedCardElement && selectedCardElement.dataset.code === card.code && selectedCardElement.dataset.index === img.dataset.index) {
        img.classList.add('selected-card');  // 選択されたカードに色をつける
      }
    });

    gameBoard.appendChild(colDiv);
  }
}



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getCardValue(card) {
  // "0S" を "10S" として扱う
  if (card.code === '0S') {
    card.code = '10S';  // 0Sを10Sとして扱う
    console.log('0Sを10Sとして処理:', card);
  }

  const face = card.code.slice(0, card.code.length === 3 ? 2 : 1);  // 例: "10" の場合は "10" それ以外は "A", "2", "3" など
  
  const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const cardValue = order.indexOf(face);

  console.log(`Card: ${card.code}, Face: ${face}, Value: ${cardValue}`);  // デバッグ用

  return cardValue;
}






function isMovableSequence(column, index) {
  for (let i = index; i < column.length - 1; i++) {
    const current = getCardValue(column[i]);
    const next = getCardValue(column[i + 1]);
    if (current !== next + 1) return false; // 9→10の順番チェック
  }
  return true;
}

let selectedCardElement = null;  // 選択されたカードのDOM要素を保持

gameBoard.addEventListener('click', e => {
  const colDiv = e.target.closest('.column');
  if (!colDiv) return;
  const colIndex = parseInt(colDiv.dataset.index);
  const cardIndex = parseInt(e.target.dataset.index);

  if (isNaN(cardIndex)) return;

  const clickedCardElement = e.target; // クリックしたカードのDOM要素を取得
  const clickedCard = board[colIndex][cardIndex]; // クリックされたカードのデータ

  // カードが裏面の場合は選択できない
  if (!clickedCard.faceUp) return;

  // 最初のカード選択
  if (!selectedCardElement) {
    // クリックされたカードを選択
    clickedCardElement.classList.add('selected-card');
    selectedCardElement = clickedCardElement;  // 選択されたカードを保持

    // その他のカードの選択状態を解除
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
      if (card !== selectedCardElement) {
        card.classList.remove('selected-card');
      }
    });

    // 選択されたカード群の処理
    if (clickedCard.faceUp && isMovableSequence(board[colIndex], cardIndex)) {
      selectedCards = board[colIndex].slice(cardIndex);  // 選択されたカード群
      selectedColumnIndex = colIndex;  // 選択した列インデックス
      renderBoard();  // 変更後のボードを再描画
    }
  } else {
    const targetColumn = board[colIndex];
    const topCard = targetColumn[targetColumn.length - 1];

    // 移動判定: 最上段のカードと選択されたカードのランクが一致するか
    if (!topCard || getCardValue(topCard) === getCardValue(selectedCards[0]) + 1) {
      // 移動処理
      board[colIndex] = board[colIndex].concat(selectedCards);  // 新しい列にカードを追加
      board[selectedColumnIndex].splice(-selectedCards.length);  // 元の列からカードを削除

      // 新しい列の最上段カードを表向きに
      const last = board[selectedColumnIndex][board[selectedColumnIndex].length - 1];
      if (last) last.faceUp = true;

      // 選択状態をリセット
      selectedCards = null;
      selectedColumnIndex = null;

      // 選択状態のスタイルをリセット（すべてのカードの選択状態をクリア）
      if (selectedCardElement) {
        selectedCardElement.classList.remove('selected-card');
        selectedCardElement = null;
      }

      checkForCompletedSet(colIndex);
      renderBoard();  // 再描画
      checkForWin();   // 勝利判定
    } else {
      // 間違ったカード移動のケース、選択状態をリセット
      if (selectedCardElement) {
        selectedCardElement.classList.remove('selected-card');
        selectedCardElement = null; // 選択状態をリセット
      }
      selectedCards = null;  // 選択カード群をリセット
      selectedColumnIndex = null;  // 選択列インデックスをリセット
      renderBoard();  // ボードを再描画
    }
  }
});

// ボードの描画
function renderBoard() {
  gameBoard.innerHTML = '';  // ゲームボードをリセット

  for (let i = 0; i < columns; i++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'column';
    colDiv.dataset.index = i;
    const col = board[i];

    col.forEach((card, j) => {
      const img = document.createElement('img');
      img.src = card.faceUp ? card.image : 'https://deckofcardsapi.com/static/img/back.png';
      img.className = 'card';
      img.style.top = `${j * 20}px`;
      img.dataset.code = card.code;
      img.dataset.index = j;
      colDiv.appendChild(img);

      // 表向きのカードのみ選択状態を反映
      if (card.faceUp && selectedCardElement) {
        const isSelectedCard = (img.dataset.code === selectedCardElement.dataset.code && img.dataset.index === selectedCardElement.dataset.index);
        if (isSelectedCard) {
          img.classList.add('selected-card');  // 選択されたカードに色をつける
        }
      }
    });

    gameBoard.appendChild(colDiv);
  }
}







document.getElementById('deal-button').addEventListener('click', () => {
  if (reserve.length < 10) return;
  for (let i = 0; i < columns; i++) {
    const card = reserve.pop();
    card.faceUp = true;
    board[i].push(card);
  }
  renderBoard();
});

function checkForCompletedSet(colIndex) {
  const col = board[colIndex];
  if (col.length < 13) return;

  const last13 = col.slice(-13);
  for (let i = 0; i < 13; i++) {
    if (getCardValue(last13[i]) !== 12 - i || last13[i].suit !== 'SPADES') return;
  }

  board[colIndex].splice(-13);
  completedSets++;
  alert(`完成したセット: ${completedSets}`);
}

function checkForWin() {
  if (completedSets === 8) {
    alert('おめでとうございます！全てのセットを完成しました！');
  }
}

initializeGame();

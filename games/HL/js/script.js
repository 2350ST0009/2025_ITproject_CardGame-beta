// グローバル変数：デッキIDと現在のカードの数値
let deckId = '';
let currentCardValue = 0;

// カードの値を日本語に変換するマッピング
const valueMap = {
  "ACE": "エース",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  "JACK": "ジャック",
  "QUEEN": "クイーン",
  "KING": "キング"
};

// カードの絵柄（スート）を日本語に変換するマッピング
const suitMap = {
  "HEARTS": "ハート",
  "DIAMONDS": "ダイヤ",
  "CLUBS": "クラブ",
  "SPADES": "スペード"
};

// ゲーム初期化関数：画面を初期化して新しいデッキを取得し、最初のカードを引く
async function initializeGame() {
    // ゲーム画面のリセット（カード表示、画像、ボタン）
    document.getElementById('game').innerHTML = `
        <div class="card" id="currentCard">読み込み中...</div>
        <img id="currentCardImage" src="" alt="カードの絵柄" style="display:none;">
        <div class="buttons">
            <button onclick="guess('High')">High</button>
            <button onclick="guess('Low')">Low</button>
        </div>
    `;

    // 新しいデッキをシャッフルして取得
    const deckResponse = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const deckData = await deckResponse.json();
    deckId = deckData.deck_id;

    // 最初のカードを引く
    await drawCard();
}

// カードを1枚引く関数
async function drawCard() {
    const cardResponse = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const cardData = await cardResponse.json();

    // カードが正常に引けたら画面に反映
    if (cardData.success && cardData.cards.length > 0) {
        const card = cardData.cards[0];

        // カードの値を取得（ゲーム判定用）
        currentCardValue = getValue(card.value);

        // カード名を日本語に変換して表示
        const cardNameJa = `${valueMap[card.value]}の${suitMap[card.suit]}`;
        document.getElementById('currentCard').innerText = cardNameJa;

        // カードの絵柄画像を表示
        const cardImageElem = document.getElementById('currentCardImage');
        cardImageElem.src = card.image;
        cardImageElem.style.display = 'block';

    } else {
        // もうカードがない場合はゲームオーバーを表示
        alert('もうカードがありません！');
        showGameOver();
    }
}

// カードの値を数値化する関数（J,Q,Kは11、Aは1、それ以外は数値）
function getValue(cardValue) {
    if (['JACK', 'QUEEN', 'KING'].includes(cardValue)) return 11;
    if (cardValue === 'ACE') return 1;
    return parseInt(cardValue);
}

// ユーザーのHigh/Low選択を判定する関数
async function guess(choice) {
    const previousValue = currentCardValue;

    // 新しいカードを引く
    await drawCard();
    const newValue = currentCardValue;

    // ユーザーの選択とカードの値を比較し、間違っていたらゲームオーバー
    if (
        !(choice === 'High' && newValue > previousValue) &&
        !(choice === 'Low' && newValue < previousValue)
    ) {
        showGameOver();
    }
}

// ゲームオーバー時の画面表示
function showGameOver() {
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = `
        <h2>ゲームオーバー</h2>
        <button onclick="initializeGame()">リスタート</button>
    `;
}


document.addEventListener('DOMContentLoaded', () => {
    loadHeader('header-container');  // ヘッダー読み込み
    initializeGame();                 // ページ読み込み時にゲーム開始
});

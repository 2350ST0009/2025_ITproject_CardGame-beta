const startBtn = document.getElementById('start-btn');
const drawBtn = document.getElementById('draw-btn');
const resultDiv = document.getElementById('result');
const playerSlot = document.getElementById('player-slot');
const cpuSlot = document.getElementById('cpu-slot');

let deckId = '';

async function initializeGame() {
  resultDiv.textContent = '';
  playerSlot.innerHTML = '';
  cpuSlot.innerHTML = '';
  drawBtn.disabled = false;

  // 新しいデッキ（ジョーカー2枚付き）を作成
  const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?jokers_enabled=true');
  const data = await res.json();
  deckId = data.deck_id;
}

async function drawCard(player) {
  const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await res.json();
  const card = data.cards[0];
  const cardImg = new Image();
  cardImg.src = card.image;
  cardImg.className = 'card';

  return new Promise((resolve) => {
    cardImg.onload = () => {
      if (player === 'player') {
        playerSlot.innerHTML = '';
        playerSlot.appendChild(cardImg);
      } else {
        cpuSlot.innerHTML = '';
        cpuSlot.appendChild(cardImg);
      }
      resolve(card);
    };
  });
}

async function playTurn() {
  drawBtn.disabled = true;

  // プレイヤーのターン
  const playerCard = await drawCard('player');
  if (playerCard.value === 'JOKER') {
    resultDiv.textContent = 'あなたはジョーカーを引きました！負けです！';
    drawBtn.disabled = true;
    return;
  }

  // CPUのターン（少し遅延）
  setTimeout(async () => {
    const cpuCard = await drawCard('cpu');
    if (cpuCard.value === 'JOKER') {
      resultDiv.textContent = 'CPUがジョーカーを引きました！あなたの勝ち！';
      drawBtn.disabled = true;
      return;
    }

    drawBtn.disabled = false;
  }, 1000);
}

startBtn.addEventListener('click', initializeGame);
drawBtn.addEventListener('click', playTurn);

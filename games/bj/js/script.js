let deckId;
let playerHand = [];
let dealerHand = [];
let hideDealerSecondCard = true;

async function startGame() {
  document.getElementById("result").textContent = "";
  playerHand = [];
  dealerHand = [];
  hideDealerSecondCard = true;

  const res = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
  const data = await res.json();
  deckId = data.deck_id;

  const draw = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`);
  const cards = (await draw.json()).cards;

  playerHand.push(cards[0], cards[2]);
  dealerHand.push(cards[1], cards[3]);

  renderCards();
  document.getElementById("hitBtn").disabled = false;
  document.getElementById("standBtn").disabled = false;

  if (getScore(playerHand) === 21) {
    endGame();
  }
}

function renderCards() {
  const playerDiv = document.getElementById("player-cards");
  const dealerDiv = document.getElementById("dealer-cards");
  playerDiv.innerHTML = "";
  dealerDiv.innerHTML = "";

  // プレイヤーのカード表示
  playerHand.forEach(card => {
    const img = document.createElement("img");
    img.src = card.image;
    playerDiv.appendChild(img);
  });

  // ディーラーのカード表示
  dealerHand.forEach((card, index) => {
    const img = document.createElement("img");
    if (index === 1 && hideDealerSecondCard) {
      img.src = "https://deckofcardsapi.com/static/img/back.png"; // 裏向き画像
    } else {
      img.src = card.image;
    }
    dealerDiv.appendChild(img);
  });

  document.getElementById("player-score").textContent = getScore(playerHand);

  // ディーラーのスコアは2枚目を伏せている間は1枚目だけ
  const dealerScore = hideDealerSecondCard
    ? getScore([dealerHand[0]])
    : getScore(dealerHand);
  document.getElementById("dealer-score").textContent = hideDealerSecondCard ? "?" : dealerScore;
}

function getCardValue(card) {
  if (["KING", "QUEEN", "JACK"].includes(card.value)) return 10;
  if (card.value === "ACE") return 11;
  return parseInt(card.value);
}

function getScore(hand) {
  let total = 0;
  let aces = 0;
  hand.forEach(card => {
    total += getCardValue(card);
    if (card.value === "ACE") aces++;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

// hitCard関数を修正
async function hitCard() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");

  // 通信中はボタンを無効化
  hitBtn.disabled = true;
  standBtn.disabled = true;

  try {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const card = (await res.json()).cards[0];
    playerHand.push(card);
    renderCards();

    if (getScore(playerHand) > 21) {
      endGame();
    } else {
      // バーストしていなければボタンを元に戻す
      hitBtn.disabled = false;
      standBtn.disabled = false;
    }
  } catch (e) {
    console.error("カードが引けませんでした", e);
    hitBtn.disabled = false;
    standBtn.disabled = false;
  }
}

async function stand() {
  hideDealerSecondCard = false;
  renderCards();

  while (getScore(dealerHand) < 17) {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const card = (await res.json()).cards[0];
    dealerHand.push(card);
    renderCards();
  }
  endGame();
}

function endGame() {
  document.getElementById("hitBtn").disabled = true;
  document.getElementById("standBtn").disabled = true;

  hideDealerSecondCard = false;
  renderCards();

  const playerScore = getScore(playerHand);
  const dealerScore = getScore(dealerHand);

  let result = "";

  if (playerScore > 21) {
    result = "プレイヤーのバースト！負け！";
  } else if (dealerScore > 21) {
    result = "ディーラーのバースト！勝ち！";
  } else if (playerScore > dealerScore) {
    result = "勝ち！";
  } else if (playerScore < dealerScore) {
    result = "負け！";
  } else {
    result = "引き分け！";
  }

  document.getElementById("result").textContent = result;
}

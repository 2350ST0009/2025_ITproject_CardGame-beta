let cards = [];
let flippedCards = [];
let matchedCards = [];
let gridSize = 4;

async function startGame() {
  document.getElementById("result").textContent = "";
  gridSize = parseInt(document.getElementById("difficulty").value);
  const pairCount = (gridSize * gridSize) / 2;

  const res = await fetch(`https://deckofcardsapi.com/api/deck/new/draw/?count=${pairCount}`);
  const data = await res.json();

  cards = [...data.cards, ...data.cards];
  shuffle(cards);
  matchedCards = [];
  flippedCards = [];
  renderCards();
  preloadImages();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function preloadImages() {
  cards.forEach(card => {
    const img = new Image();
    img.src = card.image;
  });
}

function renderCards() {
  const container = document.getElementById("player-cards");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;

  cards.forEach((card, index) => {
    const cardImg = document.createElement("img");
    cardImg.src = "https://deckofcardsapi.com/static/img/back.png";
    cardImg.classList.add("card");
    cardImg.dataset.index = index;
    cardImg.onclick = () => flipCard(index);
    container.appendChild(cardImg);
  });
}

function flipCard(index) {
  if (flippedCards.length >= 2 || matchedCards.includes(index) || flippedCards.includes(index)) return;

  const img = document.querySelectorAll(".card")[index];
  if (!img.classList.contains("flipping")) {
    img.classList.add("flipping");

    // アニメーションの途中で画像を変更
    setTimeout(() => {
      img.src = cards[index].image;
    }, 200); // 0.2秒後に画像を切り替え

    setTimeout(() => {
      img.classList.remove("flipping");
    }, 400); // アニメーションが終わったらクラスを戻す
  }

  flippedCards.push(index);

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 800);
  }
}

function checkMatch() {
  const [i1, i2] = flippedCards;
  const c1 = cards[i1];
  const c2 = cards[i2];

  if (c1.code === c2.code) {
    matchedCards.push(i1, i2);
  } else {
    const imgs = document.querySelectorAll(".card");
    imgs[i1].src = "https://deckofcardsapi.com/static/img/back.png";
    imgs[i2].src = "https://deckofcardsapi.com/static/img/back.png";
  }

  flippedCards = [];

  if (matchedCards.length === cards.length) {
    document.getElementById("result").textContent = "すべて揃いました！おめでとうございます！";
  }
}

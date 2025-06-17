const startBtn = document.getElementById("startBtn");
const levelSelect = document.getElementById("level");
const cardContainer = document.getElementById("cardContainer");
const answerForm = document.getElementById("answerForm");
const inputFields = document.getElementById("inputFields");
const resultDiv = document.getElementById("result");
const bestScoreSpan = document.getElementById("bestScore");

let cards = [];
let bestScore = localStorage.getItem("bestScoreSuit") || 0;
bestScoreSpan.textContent = bestScore;

// 難易度設定
const levelSettings = {
  easy: { count: 4, delay: 7000 },
  normal: { count: 6, delay: 5000 },
  hard: { count: 8, delay: 3000 },
  expert: { count: 10, delay: 2500 } // ←追加
};

startBtn.addEventListener("click", async () => {
  const level = levelSelect.value;
  const { count, delay } = levelSettings[level];

  resultDiv.textContent = "";
  inputFields.innerHTML = "";
  cardContainer.innerHTML = "";
  answerForm.style.display = "none";

  const res1 = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
  const deck = await res1.json();
  const res2 = await fetch(`https://deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=${count}`);
  const data = await res2.json();
  cards = data.cards;

  cards.forEach(card => {
    const img = document.createElement("img");
    img.src = card.image;
    const div = document.createElement("div");
    div.className = "card";
    div.appendChild(img);
    cardContainer.appendChild(div);
  });

  // 一定時間後に裏返し＆入力表示
  setTimeout(() => {
    [...cardContainer.children].forEach(c => c.classList.add("hidden"));
    showInputForm(count);
  }, delay);
});

function showInputForm(count) {
  inputFields.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "input-row";
    div.innerHTML = `
      <label>${i + 1}枚目のスート：</label>
      <select>
        <option value="SPADES">♠ SPADE</option>
        <option value="HEARTS">♥ HEART</option>
        <option value="DIAMONDS">♦ DIAMOND</option>
        <option value="CLUBS">♣ CLUB</option>
      </select>
    `;
    inputFields.appendChild(div);
  }

  answerForm.style.display = "block";
}

answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInputs = [...inputFields.querySelectorAll("select")].map(sel => sel.value);
  const correctSuits = cards.map(card => card.suit); // suit = "SPADES", "HEARTS" など

  let score = 0;
  userInputs.forEach((val, i) => {
    if (val === correctSuits[i]) score++;
  });

  resultDiv.innerHTML = `<h3>あなたのスコア：${score}/${cards.length}</h3>`;

  if (score > bestScore) {
    localStorage.setItem("bestScoreSuit", score);
    bestScoreSpan.textContent = score;
    resultDiv.innerHTML += `<p>🎉 新記録！</p>`;
  }

  answerForm.style.display = "none";
});

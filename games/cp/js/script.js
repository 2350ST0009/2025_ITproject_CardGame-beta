let deckId = "";
let drawPile = [];
let grid = [];
let gridRows = 4;
let gridCols = 4;
let selectedCard = null;

const playerCards = document.getElementById("player-cards");
const result = document.getElementById("result");
const drawBtn = document.getElementById("draw-btn");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
drawBtn.addEventListener("click", drawCard);

function normalizeValue(value) {
  const map = { "ACE": 1, "JACK": 11, "QUEEN": 12, "KING": 13 };
  if (typeof value === "string") {
    return map[value] || parseInt(value, 10);
  }
  return value;
}

function startGame() {
  result.textContent = "";
  selectedCard = null;
  gridRows = 4;
  gridCols = 4;
  grid = [];

  for (let r = 0; r < gridRows; r++) {
    grid[r] = new Array(gridCols).fill(null);
  }

  fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
    .then(res => res.json())
    .then(data => {
      deckId = data.deck_id;
      return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`);
    })
    .then(res => res.json())
    .then(data => {
      drawPile = data.cards;
      for (let i = 0; i < gridRows * gridCols; i++) {
        const r = Math.floor(i / gridCols);
        const c = i % gridCols;
        grid[r][c] = drawPile.shift();
      }
      renderGrid();
      drawBtn.disabled = false;
      startBtn.disabled = true;
      resetBtn.disabled = false;
    })
    .catch(err => {
      console.error("Error fetching deck:", err);
    });
}

function resetGame() {
  selectedCard = null;
  grid = [];
  drawPile = [];
  result.textContent = "";
  playerCards.innerHTML = "";
  drawBtn.disabled = true;
  startBtn.disabled = false;
  resetBtn.disabled = true;
}

function drawCard() {
  if (drawPile.length === 0) {
    drawBtn.disabled = true;
    return;
  }

  const card = drawPile.shift();
  placeCard(card);     // 1. 置く
  compressGrid();      // 2. 圧縮（縦方向）
  renderGrid();        // 3. 描画
  checkGameOver();     // 4. 終了チェック
}

function placeCard(card) {
  // 上から空きを探して配置（縦方向詰めに合うように）
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = card;
        return;
      }
    }
  }

  // 空きがなければ新しい行を追加
  const newRow = new Array(gridCols).fill(null);
  newRow[0] = card;
  grid.push(newRow);
  gridRows++;
}

function renderGrid() {
  playerCards.innerHTML = "";
  playerCards.style.display = "grid";
  playerCards.style.gridTemplateColumns = `repeat(${gridCols}, 100px)`;
  playerCards.style.gap = "4px";

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const card = grid[r][c];
      if (!card) continue;

      const cell = document.createElement("div");
      cell.className = "cell";

      const img = document.createElement("img");
      img.className = "card";
      img.dataset.row = r;
      img.dataset.col = c;
      img.src = card.image;
      img.alt = card.code;
      img.onclick = () => cardClick(r, c);

      if (selectedCard && selectedCard.r === r && selectedCard.c === c) {
        img.classList.add("selected");
        img.style.border = "3px solid yellow";
      }

      cell.appendChild(img);
      playerCards.appendChild(cell);
    }
  }
}

function cardClick(r, c) {
  const clicked = grid[r][c];
  if (!clicked) return;

  console.log("Selected card:", selectedCard ? grid[selectedCard.r][selectedCard.c].value : null);
  console.log("Clicked card:", clicked.value);

  if (!selectedCard) {
    selectedCard = { r, c };
    renderGrid();
    return;
  }

  const selected = grid[selectedCard.r][selectedCard.c];

  if (
    (r !== selectedCard.r || c !== selectedCard.c) &&
    isAdjacent(selectedCard.r, selectedCard.c, r, c) &&
    normalizeValue(selected.value) === normalizeValue(clicked.value)
  ) {
    console.log("Pair found! Removing cards:", selected.value, clicked.value);
    grid[selectedCard.r][selectedCard.c] = null;
    grid[r][c] = null;
    selectedCard = null;

    compressGrid();
    renderGrid();
    showResultIfCleared();
  } else {
    console.log("No pair:", {
      selectedPos: selectedCard,
      clickedPos: { r, c },
      isAdj: isAdjacent(selectedCard.r, selectedCard.c, r, c),
      valSelected: normalizeValue(selected.value),
      valClicked: normalizeValue(clicked.value),
    });
    selectedCard = { r, c };
    renderGrid();
  }
}

function compressGrid() {
  // 縦方向に圧縮（上に詰める）
  for (let c = 0; c < gridCols; c++) {
    const colCards = [];
    for (let r = 0; r < gridRows; r++) {
      if (grid[r][c] !== null) colCards.push(grid[r][c]);
    }
    for (let r = 0; r < gridRows; r++) {
      grid[r][c] = r < colCards.length ? colCards[r] : null;
    }
  }

  // 空の行を削除（下から）
  while (gridRows > 4 && grid[gridRows - 1].every(cell => cell === null)) {
    grid.pop();
    gridRows--;
  }
}

function isAdjacent(r1, c1, r2, c2) {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  console.log(`isAdjacent check: (${r1},${c1}) vs (${r2},${c2}) -> dr=${dr}, dc=${dc}`);
  return (dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0));
}

function showResultIfCleared() {
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (grid[r][c] !== null) {
        result.textContent = "";
        return;
      }
    }
  }
  result.textContent = "🎉 すべてのカップルが見つかりました！ 🎉";
  drawBtn.disabled = true;
}

function checkGameOver() {
  if (drawPile.length === 0 && !hasPairs()) {
    result.textContent = "🎉 すべてのカップルが見つかりました！ 🎉";
    drawBtn.disabled = true;
  }
}

function hasPairs() {
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const card = grid[r][c];
      if (!card) continue;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= gridRows || nc < 0 || nc >= gridCols) continue;
          const neighbor = grid[nr][nc];
          if (neighbor && normalizeValue(neighbor.value) === normalizeValue(card.value)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

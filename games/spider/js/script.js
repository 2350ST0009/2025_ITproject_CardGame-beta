const gameBoard = document.getElementById('game-board');
const status = document.getElementById('status');
let board = [];
let reserve = [];
let selectedCards = null;
let selectedColumnIndex = null;
let completedSets = 0;
const columns = 10;

// カードのランク順序
const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

async function initializeGame() {
    status.textContent = "デッキ準備中...";
    try {
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/draw/?count=52');
        const data = await response.json();
        const allSpades = data.cards.filter(c => c.suit === 'SPADES');

        if (allSpades.length < 13) {
            alert('カードの取得に失敗しました。再読み込みしてください。');
            return;
        }

        // 104枚のスペードデッキを作成
        let spadesDeck = [];
        for (let i = 0; i < 8; i++) {
            spadesDeck = spadesDeck.concat(allSpades.map(c => ({ ...c, faceUp: false })));
        }
        shuffle(spadesDeck);

        setupBoard(spadesDeck);
        status.textContent = "ゲーム開始！";
    } catch (e) {
        status.textContent = "エラーが発生しました。";
        console.error(e);
    }
}

function setupBoard(allCards) {
    board = Array.from({ length: columns }, () => []);
    for (let i = 0; i < 54; i++) {
        const colIndex = i % columns;
        const card = allCards.shift();
        board[colIndex].push(card);
    }
    board.forEach(col => {
        if (col.length > 0) col[col.length - 1].faceUp = true;
    });
    reserve = allCards;
    renderBoard();
}

function getCardValue(card) {
    let val = card.code.replace('S', '');
    if (val === '0') val = '10';
    return order.indexOf(val);
}

function isMovableSequence(column, index) {
    for (let i = index; i < column.length - 1; i++) {
        const current = getCardValue(column[i]);
        const next = getCardValue(column[i + 1]);
        if (current !== next + 1) return false;
    }
    return true;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    board.forEach((col, i) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'column';
        colDiv.dataset.index = i;

        col.forEach((card, j) => {
            const img = document.createElement('img');
            img.src = card.faceUp ? card.image : 'https://deckofcardsapi.com/static/img/back.png';
            img.className = 'card';
            img.style.top = `${j * 25}px`;
            img.dataset.col = i;
            img.dataset.idx = j;

            if (selectedCards && selectedColumnIndex === i && j >= (col.length - selectedCards.length)) {
                img.classList.add('selected-card');
            }
            colDiv.appendChild(img);
        });
        gameBoard.appendChild(colDiv);
    });
}

gameBoard.addEventListener('click', e => {
    const target = e.target;
    const colDiv = target.closest('.column');
    if (!colDiv) return;

    const colIndex = parseInt(colDiv.dataset.index);

    if (selectedCards !== null) {
        const targetColumn = board[colIndex];
        const topCard = targetColumn[targetColumn.length - 1];
        const canMove = !topCard || getCardValue(topCard) === getCardValue(selectedCards[0]) + 1;

        if (canMove) {
            board[colIndex] = board[colIndex].concat(selectedCards);
            board[selectedColumnIndex].splice(-selectedCards.length);

            const last = board[selectedColumnIndex][board[selectedColumnIndex].length - 1];
            if (last) last.faceUp = true;

            checkForCompletedSet(colIndex);
        }
        selectedCards = null;
        selectedColumnIndex = null;
        renderBoard();
        checkForWin();
    } else if (target.classList.contains('card')) {
        const cardIndex = parseInt(target.dataset.idx);
        const clickedCard = board[colIndex][cardIndex];

        if (clickedCard.faceUp && isMovableSequence(board[colIndex], cardIndex)) {
            selectedCards = board[colIndex].slice(cardIndex);
            selectedColumnIndex = colIndex;
            renderBoard();
        }
    }
});

function checkForCompletedSet(colIndex) {
    const col = board[colIndex];
    if (col.length < 13) return;

    for (let i = 0; i <= col.length - 13; i++) {
        const potentialSet = col.slice(i, i + 13);
        const isComplete = potentialSet.every((card, idx) => 
            card.faceUp && getCardValue(card) === 12 - idx
        );

        if (isComplete) {
            board[colIndex].splice(i, 13);
            completedSets++;
            status.textContent = `セット完成！ (${completedSets}/8)`;
            if (board[colIndex].length > 0) {
                board[colIndex][board[colIndex].length - 1].faceUp = true;
            }
            break;
        }
    }
}

document.getElementById('deal-button').addEventListener('click', () => {
    if (board.some(col => col.length === 0)) {
        alert('空の列を埋めてから配ってください！');
        return;
    }
    if (reserve.length < 10) return;
    for (let i = 0; i < columns; i++) {
        const card = reserve.shift();
        card.faceUp = true;
        board[i].push(card);
    }
    renderBoard();
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkForWin() {
    if (completedSets === 8) {
        status.textContent = "おめでとう！完全勝利です！";
        status.style.color = "gold";
    }
}

initializeGame();
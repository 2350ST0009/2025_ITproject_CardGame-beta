document.addEventListener('DOMContentLoaded', function () {
    let deckId;
    let redStreak = 0;
    let blackStreak = 0;
    let mode = {};
    let history = [];

    // デッキ作成
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then(res => res.json())
        .then(data => {
            deckId = data.deck_id;
            console.log("Deck Ready:", deckId);
        });

    function setMode(streakCount, color) {
        if (!deckId) {
            alert("デッキを準備中です。少々お待ちください。");
            return;
        }
        mode.streakCount = streakCount;
        mode.color = color;
        redStreak = 0;
        blackStreak = 0;
        history = [];
        
        document.getElementById('result').textContent = '';
        document.getElementById('draw-button').disabled = false;
        document.getElementById('draw-button').textContent = 'カードを引く';
        document.getElementById('reset-button').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'none';
        updateHistory();
    }

    function drawCard() {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(res => res.json())
            .then(data => {
                let card = data.cards[0];
                history.push(card); 
                updateHistory();

                // スート（柄）から色を判定
                const isRed = (card.suit === 'HEARTS' || card.suit === 'DIAMONDS');
                
                if (isRed) {
                    redStreak++;
                    blackStreak = 0;
                    checkGameStatus('red');
                } else {
                    blackStreak++;
                    redStreak = 0;
                    checkGameStatus('black');
                }
            });
    }

    function updateHistory() {
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';

        history.forEach(card => {
            const cardEl = document.createElement('img');
            cardEl.src = card.image;
            cardEl.alt = `${card.value} of ${card.suit}`;
            cardEl.classList.add('card');
            historyDiv.appendChild(cardEl);
        });

        // 最後のカードまで自動スクロール
        if (historyDiv.lastChild) {
            historyDiv.lastChild.scrollIntoView({ behavior: 'smooth', inline: 'end' });
        }
    }

    function checkGameStatus(lastColor) {
        const currentStreak = (lastColor === 'red') ? redStreak : blackStreak;
        
        if (lastColor === mode.color && currentStreak >= mode.streakCount) {
            document.getElementById('result').textContent = `${mode.color === 'red' ? '赤' : '黒'}が${mode.streakCount}枚連続しました！クリア！`;
            disableButton();
        }
    }

    function disableButton() {
        document.getElementById('draw-button').disabled = true;
        document.getElementById('draw-button').textContent = 'ゲーム終了';
        document.getElementById('reset-button').style.display = 'inline-block';
    }

    function resetGame() {
        document.getElementById('mode-selection').style.display = 'block';
        document.getElementById('reset-button').style.display = 'none';
        document.getElementById('draw-button').disabled = true;
        document.getElementById('draw-button').textContent = 'カードを引く';
        document.getElementById('result').textContent = '';
        history = [];
        updateHistory();
        redStreak = 0;
        blackStreak = 0;
    }

    // ボタンイベント
    document.getElementById('red-3').addEventListener('click', () => setMode(3, 'red'));
    document.getElementById('red-5').addEventListener('click', () => setMode(5, 'red'));
    document.getElementById('black-3').addEventListener('click', () => setMode(3, 'black'));
    document.getElementById('black-5').addEventListener('click', () => setMode(5, 'black'));
    document.getElementById('draw-button').addEventListener('click', drawCard);
    document.getElementById('reset-button').addEventListener('click', resetGame);
});
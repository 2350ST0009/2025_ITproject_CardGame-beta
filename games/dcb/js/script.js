let deckId = null;
const MAX_HP = 100;
let playerHp = MAX_HP;
let enemyHp = MAX_HP;

const battleBtn = document.getElementById('battleBtn');
const resetBtn = document.getElementById('resetBtn');
const resultText = document.getElementById('result');

const pHpBar = document.getElementById('p-hp-bar');
const eHpBar = document.getElementById('e-hp-bar');
const pHpNum = document.getElementById('p-hp-num');
const eHpNum = document.getElementById('e-hp-num');

const pCardArea = document.getElementById('p-card-area');
const eCardArea = document.getElementById('e-card-area');
const pDamageText = document.getElementById('p-damage');
const eDamageText = document.getElementById('e-damage');

async function createDeck() {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await res.json();
    deckId = data.deck_id;
}

function getPower(val) {
    const map = { "ACE": 14, "KING": 13, "QUEEN": 12, "JACK": 11 };
    return map[val] || parseInt(val);
}

function getMultiplier(atkSuit, defSuit) {
    if (atkSuit === defSuit) return 1.0;
    const rules = {
        "SPADES": "HEARTS",
        "HEARTS": "CLUBS",
        "CLUBS": "DIAMONDS",
        "DIAMONDS": "SPADES"
    };
    if (rules[atkSuit] === defSuit) return 2.0;
    if (rules[defSuit] === atkSuit) return 0.5;
    return 1.0;
}

async function battle() {
    if (!deckId) await createDeck();
    
    battleBtn.disabled = true;
    resultText.textContent = "Draw...";

    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
    const data = await res.json();

    if (data.cards.length < 2) {
        resultText.textContent = "Shuffle...";
        await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
        battleBtn.disabled = false;
        return;
    }

    const pCard = data.cards[0];
    const eCard = data.cards[1];

    displayCard(pCardArea, pCard);
    displayCard(eCardArea, eCard);

    const pDmg = Math.floor(getPower(pCard.value) * getMultiplier(pCard.suit, eCard.suit));
    const eDmg = Math.floor(getPower(eCard.value) * getMultiplier(eCard.suit, pCard.suit));

    enemyHp = Math.max(0, enemyHp - pDmg);
    playerHp = Math.max(0, playerHp - eDmg);
    updateHp();

    showDamage(eDamageText, pDmg, getMultiplier(pCard.suit, eCard.suit) === 2.0);
    showDamage(pDamageText, eDmg, getMultiplier(eCard.suit, pCard.suit) === 2.0);

    if (pDmg > eDmg) resultText.textContent = "Good Hit!";
    else if (pDmg < eDmg) resultText.textContent = "Bad Hit...";
    else resultText.textContent = "Even!";

    if (playerHp <= 0 || enemyHp <= 0) {
        if (playerHp <= 0 && enemyHp <= 0) resultText.textContent = "DRAW (Double KO)";
        else if (playerHp <= 0) {
            resultText.textContent = "YOU LOSE...";
            resultText.style.color = "#ff5252";
        }
        else {
            resultText.textContent = "YOU WIN!!";
            resultText.style.color = "#4caf50";
        }
        battleBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
    } else {
        battleBtn.disabled = false;
    }
}

function updateHp() {
    pHpNum.textContent = playerHp;
    eHpNum.textContent = enemyHp;
    pHpBar.style.width = `${(playerHp / MAX_HP) * 100}%`;
    eHpBar.style.width = `${(enemyHp / MAX_HP) * 100}%`;

    if (playerHp < 30) pHpBar.classList.add('low');
    else pHpBar.classList.remove('low');
}

function showDamage(el, dmg, isCritical) {
    el.textContent = isCritical ? `${dmg}!!` : dmg;
    el.style.color = isCritical ? "#ff1744" : "#ffeb3b";
    el.style.fontSize = isCritical ? "2.5em" : "2em";
    
    el.classList.remove('damage-anim');
    void el.offsetWidth;
    el.classList.add('damage-anim');
}

function displayCard(area, card) {
    area.innerHTML = `<div class="card"><img src="${card.image}"></div>`;
}

function resetGame() {
    playerHp = MAX_HP;
    enemyHp = MAX_HP;
    updateHp();
    pCardArea.innerHTML = '<div class="card" style="background: rgba(0,0,0,0.2); border: 2px dashed #555;"></div>';
    eCardArea.innerHTML = '<div class="card" style="background: rgba(0,0,0,0.2); border: 2px dashed #555;"></div>';
    resultText.textContent = "Battle Start";
    resultText.style.color = "#fff";
    battleBtn.style.display = 'inline-block';
    battleBtn.disabled = false;
    resetBtn.style.display = 'none';
    pHpBar.classList.remove('low');
    createDeck();
}

battleBtn.addEventListener('click', battle);
resetBtn.addEventListener('click', resetGame);
createDeck();
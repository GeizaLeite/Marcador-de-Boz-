const players = [];
const categories = ['as', 'ful', 'quadra', 'duque', 'seguida', 'quina', 'terno', 'quadrada', 'sena', 'general'];
const categoryScores = {
    as: [1, 2, 3, 4, 5],
    duque: [2, 4, 6, 8, 10],
    terno: [3, 6, 9, 12, 15],
    quadra: [4, 8, 12, 16, 20],
    quina: [5, 10, 15, 20, 25],
    sena: [6, 12, 18, 24, 30],
    seguida: [20,25],
    ful: [10,15],
    quadrada: [30,35],
    general: [40, 100]
};

let gameCount = 1;
let currentPlayerIndex = 0;
let activeCategory = null;

document.getElementById('addPlayerButton').addEventListener('click', addPlayer);
document.getElementById('endGameButton').addEventListener('click', endGame);
document.getElementById('resetAllButton').addEventListener('click', resetAll);
document.getElementById('scoreOptionsPanel').querySelector('.close-panel-button').addEventListener('click', () => {
    document.getElementById('scoreOptionsPanel').classList.add('hidden');
});
document.getElementById('closePopupButton').addEventListener('click', closePopupAndStartNewGame);

function renderAll() {
    renderPlayerMenu();
    renderCurrentPlayerCard();
    renderScoreboard();
}

function addPlayer() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerName = playerNameInput.value.trim();

    if (playerName === '') {
        alert('Por favor, digite o nome do jogador.');
        return;
    }

    const newPlayer = {
        name: playerName,
        scores: {},
        id: `player-${players.length + 1}`,
        wins: 0
    };

    categories.forEach(cat => {
        newPlayer.scores[cat] = null;
    });

    players.push(newPlayer);
    playerNameInput.value = '';
    
    renderAll();
}

function renderPlayerMenu() {
    const playerMenu = document.getElementById('playerMenu');
    playerMenu.innerHTML = '';
    
    players.forEach((player, index) => {
        const button = document.createElement('button');
        button.innerHTML = `${player.name} (${player.wins})`;
        button.className = 'player-menu-item';
        if (index === currentPlayerIndex) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            switchViewToPlayer(index);
            renderAll();
        });
        playerMenu.appendChild(button);
    });
}

function switchViewToPlayer(index) {
    if (index >= 0 && index < players.length) {
        currentPlayerIndex = index;
    }
}

function renderCurrentPlayerCard() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = '';
    
    if (players.length === 0) {
        return;
    }
    
    const player = players[currentPlayerIndex];
    const playerCard = document.createElement('section');
    playerCard.className = 'player-card';
    playerCard.id = player.id;

    let gridHtml = categories.map(cat => {
        let colorClass = '';
        if (['as', 'duque', 'terno'].includes(cat)) {
            colorClass = 'yellow';
        } else if (['ful', 'seguida', 'quadrada', 'general'].includes(cat)) {
            colorClass = 'green';
        } else {
            colorClass = 'aqua';
        }
        
        let displayCatName = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (cat === 'seguida') displayCatName = 'Seguida';
        if (cat === 'ful') displayCatName = 'Full';
        if (cat === 'quadrada') displayCatName = 'Quadrada';
        if (cat === 'general') displayCatName = 'General';
        
        const score = player.scores[cat] !== null ? (player.scores[cat] === 0 ? 'X' : player.scores[cat]) : '';
        const scoredClass = score !== '' ? 'scored' : '';

        return `<div class="grid-item ${colorClass} ${cat} ${scoredClass}" data-player-id="${player.id}" data-category="${cat}">
                    <span class="category-name">${displayCatName}</span>
                    <span class="score-value">${score}</span>
                </div>`;
    }).join('');

    const cardContent = `
        <div class="player-header">
            <h2>${player.name}</h2>
            <button class="remove-player-button" data-player-id="${player.id}">Remover</button>
        </div>
        <div class="bozo-grid">
            ${gridHtml}
        </div>
        <p class="total-score">Total: <span id="total-${player.id}">${Object.values(player.scores).filter(s => s !== null).reduce((sum, current) => sum + current, 0)}</span></p>
    `;

    playerCard.innerHTML = cardContent;
    gameContainer.appendChild(playerCard);
    
    attachEventListeners();
}

function attachEventListeners() {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.removeEventListener('click', handleGridItemClick);
        item.addEventListener('click', handleGridItemClick);
    });
    
    document.querySelectorAll('.remove-player-button').forEach(button => {
        button.removeEventListener('click', handleRemovePlayer);
        button.addEventListener('click', handleRemovePlayer);
    });
}

function handleGridItemClick(event) {
    const item = event.currentTarget;
    const category = item.getAttribute('data-category');
    const player = players[currentPlayerIndex];

    activeCategory = category;

    const optionsPanel = document.getElementById('scoreOptionsPanel');
    const optionsContainer = document.getElementById('scoreOptions');
    optionsContainer.innerHTML = '';

    const scores = categoryScores[category] || [];
    
    const xButton = document.createElement('button');
    xButton.innerText = 'X';
    xButton.className = 'x-option';
    xButton.addEventListener('click', () => selectScore(0));
    optionsContainer.appendChild(xButton);

    scores.forEach(score => {
        const button = document.createElement('button');
        button.innerText = score;
        button.addEventListener('click', () => selectScore(score));
        optionsContainer.appendChild(button);
    });

    optionsPanel.classList.remove('hidden');
}

function selectScore(score) {
    const player = players[currentPlayerIndex];
    if (player && activeCategory !== null) {
        player.scores[activeCategory] = score;
        document.getElementById('scoreOptionsPanel').classList.add('hidden');
        
        if (activeCategory === 'general' && score === 100) {
            handleGameEndImmediately(player);
            return;
        }

        if (checkIfGameIsOver()) {
            endGame();
            return;
        }

        if (players.length > 1) {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }

        renderAll();
    }
}

function checkIfGameIsOver() {
    for (const player of players) {
        for (const cat of categories) {
            if (player.scores[cat] === null) {
                return false;
            }
        }
    }
    return true;
}

function handleRemovePlayer(event) {
    const playerId = event.currentTarget.getAttribute('data-player-id');
    const playerIndexToRemove = players.findIndex(p => p.id === playerId);
    if (playerIndexToRemove > -1) {
        players.splice(playerIndexToRemove, 1);
        if (playerIndexToRemove <= currentPlayerIndex && currentPlayerIndex > 0) {
            currentPlayerIndex--;
        }
    }

    renderAll();
}

function updateTotal(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        const total = Object.values(player.scores).filter(s => s !== null).reduce((sum, current) => sum + current, 0);
        const totalElement = document.getElementById(`total-${player.id}`);
        if(totalElement) {
            totalElement.innerText = total;
        }
    }
}

function renderScoreboard() {
    const scoreboardList = document.getElementById('scoreboardList');
    scoreboardList.innerHTML = '';
    
    if (players.length > 0) {
        players.sort((a, b) => b.wins - a.wins);
        players.forEach(player => {
            const li = document.createElement('li');
            li.innerText = `${player.name}: ${player.wins} vitórias`;
            scoreboardList.appendChild(li);
        });
    } else {
        document.getElementById('scoreboard').classList.add('hidden');
    }
}

function endGame() {
    if (players.length === 0) {
        alert("Não há jogadores para finalizar a partida.");
        return;
    }

    let winner = players[0];
    let highestScore = Object.values(winner.scores).filter(s => s !== null).reduce((sum, current) => sum + current, 0);

    players.forEach(player => {
        const total = Object.values(player.scores).filter(s => s !== null).reduce((sum, current) => sum + current, 0);
        if (total > highestScore) {
            highestScore = total;
            winner = player;
        }
    });

    winner.wins++;
    showFinalScoreboard(winner);
    
    gameCount++;
    document.getElementById('gameCount').innerText = gameCount;
}

function handleGameEndImmediately(winner) {
    winner.wins++;
    showFinalScoreboard(winner);
    gameCount++;
    document.getElementById('gameCount').innerText = gameCount;
}

function showFinalScoreboard(winner) {
    const winnerNameElement = document.getElementById('winnerName');
    winnerNameElement.innerText = `${winner.name} VENCEU!`;
    
    const finalScoresList = document.getElementById('finalScores');
    finalScoresList.innerHTML = '';
    
    players.forEach(player => {
        const totalScore = Object.values(player.scores).filter(s => s !== null).reduce((sum, current) => sum + current, 0);
        const scoreItem = document.createElement('p');
        scoreItem.innerText = `${player.name}: ${totalScore} pontos`;
        finalScoresList.appendChild(scoreItem);
    });

    document.getElementById('winnerPopup').classList.remove('hidden');
}

function closePopupAndStartNewGame() {
    document.getElementById('winnerPopup').classList.add('hidden');

    players.forEach(player => {
        categories.forEach(cat => {
            player.scores[cat] = null;
        });
    });
    
    currentPlayerIndex = 0;
    renderAll();
}

function resetAll() {
    if (confirm("Tem certeza que deseja zerar o jogo? Todos os jogadores e vitórias serão perdidos.")) {
        players.splice(0, players.length);
        gameCount = 1;
        document.getElementById('gameCount').innerText = gameCount;
        currentPlayerIndex = 0;
        document.getElementById('playerNameInput').value = '';
        
        renderAll();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});
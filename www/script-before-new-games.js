const app = document.getElementById("app");

let selectedPlayers = 2;
let gameRunning = false;
let scores = [];
let timers = [];
let reactionReady = false;
let battlePower = 0;

const games = [
    { name:"Tap Rush", icon:"⚡", description:"First player to reach 50 taps wins." },
    { name:"Reaction Race", icon:"🚦", description:"Wait for the five red lights to go OFF, then tap!" },
    { name:"Tap Battle", icon:"⚔️", description:"Push the battle meter to your side." },
    { name:"Target Smash", icon:"🎯", description:"Hit targets. First to 15 wins." },
    { name:"Dash Duel", icon:"🏃", description:"Tap rapidly and race to 100%." },
    { name:"Coin Grab", icon:"🪙", description:"Grab coins before the other players." },
    { name:"Quick Choice", icon:"🧠", description:"Choose the correct symbol quickly." }
];

function clearAllTimers() {
    timers.forEach(t => {
        clearTimeout(t);
        clearInterval(t);
    });
    timers = [];
}

function addTimer(t) {
    timers.push(t);
    return t;
}

function stopTimers() {
    clearAllTimers();
    gameRunning = false;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function vibrate(pattern = 20) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

function finishLater(player, title, subtitle, delay = 700) {
    gameRunning = false;
    addTimer(setTimeout(() => {
        finishGame(player, title, subtitle);
    }, delay));
}

function runCountdown(callback) {
    const overlay = document.getElementById("countdown");
    const number = document.getElementById("countdownNumber");

    if (!overlay || !number) {
        callback();
        return;
    }

    let count = 3;
    number.textContent = count;

    const timer = addTimer(setInterval(() => {
        count--;

        if (count <= 0) {
            clearInterval(timer);
            overlay.remove();
            callback();
        } else {
            number.textContent = count;
        }
    }, 700));
}

/* HOME */

function showHome() {
    stopTimers();

    app.innerHTML = `
        <div class="home">

            <div class="logo">
                <strong>PARTY CLASH</strong>
                <span>LOCAL MULTIPLAYER</span>
            </div>

            <div class="home-status">
                <div class="home-status-title">PARTY CLASH</div>
                <div class="home-status-text">CHOOSE PLAYERS</div>
            </div>

            <div class="home-players">

                <button class="corner-player player-1"
                        onclick="choosePlayers(2)">
                    2 PLAYERS
                </button>

                <button class="corner-player player-2"
                        onclick="choosePlayers(3)">
                    3 PLAYERS
                </button>

                <button class="corner-player player-3"
                        onclick="choosePlayers(4)">
                    4 PLAYERS
                </button>

                <button class="corner-player player-4"
                        onclick="showTournament()">
                    🏆 CUP
                </button>

            </div>

            <button class="home-mini-games"
                    onclick="choosePlayers(2)">
                🎮 MINI GAMES
            </button>

            <div class="home-reaction-message">
                2 • 3 • 4 PLAYERS • ONE DEVICE
            </div>

        </div>
    `;
}

function choosePlayers(count) {
    selectedPlayers = count;
    showGameSelect();
}

/* GAME LIBRARY */

function showGameSelect() {
    stopTimers();

    const cards = games.map((game, index) => `
        <div class="game-card" onclick="startGame(${index})">

            <div class="game-icon">${game.icon}</div>

            <h3>${game.name}</h3>

            <p>${game.description}</p>

            <div class="play-label">PLAY →</div>

        </div>
    `).join("");

    app.innerHTML = `
        <div class="select-page">

            <div class="topbar">

                <button class="back-btn"
                        onclick="showHome()">
                    ← BACK
                </button>

                <div>
                    <div class="top-title">GAME LIBRARY</div>
                    <div class="top-subtitle">
                        ${selectedPlayers} PLAYERS
                    </div>
                </div>

                <div></div>

            </div>

            <div class="select-content">

                <h1 class="section-title">
                    ${selectedPlayers} PLAYER GAMES
                </h1>

                <p class="section-subtitle">
                    Choose a mini-game and battle on one device.
                </p>

                <div class="games-grid">
                    ${cards}
                </div>

            </div>

        </div>
    `;
}

/* ROUTER */

function startGame(index) {
    switch (index) {
        case 0: startTapRush(); break;
        case 1: startReactionRace(); break;
        case 2: startTapBattle(); break;
        case 3: startTargetSmash(); break;
        case 4: startDashDuel(); break;
        case 5: startCoinGrab(); break;
        case 6: startQuickChoice(); break;
    }
}

function gameCountdownHTML() {
    return `
        <div class="countdown" id="countdown">
            <div class="countdown-number" id="countdownNumber">3</div>
        </div>
    `;
}

/* 1 — TAP RUSH */

function startTapRush() {
    stopTimers();
    scores = Array(selectedPlayers).fill(0);
    createTapRush();

    runCountdown(() => {
        gameRunning = true;

        document.querySelectorAll(".tap-rush-zone").forEach(zone => {
            zone.addEventListener("pointerdown", tapRushPlayer, {
                passive:false
            });
        });
    });
}

function createTapRush() {
    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>⚡ TAP RUSH</h2>
                <p>FIRST TO 50 TAPS WINS</p>
            </div>

            <div class="players-area players-${selectedPlayers}">
                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone tap-rush-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="tap-text">TAP!</div>

                        <div class="score">0 / 50</div>

                    </div>
                `).join("")}
            </div>

            <div class="game-footer">
                TAP ANYWHERE INSIDE YOUR PLAYER AREA
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function tapRushPlayer(e) {
    e.preventDefault();

    if (!gameRunning) return;

    const zone = e.currentTarget;
    const player = Number(zone.dataset.player);

    scores[player]++;

    const score = zone.querySelector(".score");

    if (score) {
        score.textContent = `${scores[player]} / 50`;
    }

    zone.classList.add("pressed");

    setTimeout(() => {
        zone.classList.remove("pressed");
    }, 80);

    vibrate(8);

    if (scores[player] >= 50) {

        zone.classList.add("winner");

        const text = zone.querySelector(".tap-text");

        if (text) text.textContent = "WINNER!";

        finishLater(
            player,
            "TAP RUSH",
            "50 TAPS"
        );
    }
}

/* 2 — REACTION RACE */

function startReactionRace() {
    stopTimers();

    scores = Array(selectedPlayers).fill(0);
    reactionReady = false;

    createReactionRace();

    runCountdown(() => {
        startReactionRound();
    });
}

function createReactionRace() {
    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>🚦 REACTION RACE</h2>
                <p>FIRST TO 5 POINTS WINS</p>
            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone reaction-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="tap-text">
                            WAIT...
                        </div>

                        <div class="score">
                            0 / 5
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer"
                 id="reactionMessage">
                WATCH THE FIVE RED LIGHTS
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function startReactionRound() {
    clearAllTimers();

    reactionReady = false;
    gameRunning = true;

    const screen = document.querySelector(".game-screen");
    const message = document.getElementById("reactionMessage");

    if (!screen) return;

    const oldLights =
        document.querySelector(".reaction-lights");

    if (oldLights) oldLights.remove();

    const lights = document.createElement("div");

    lights.className = "reaction-lights";

    lights.innerHTML = `
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
    `;

    screen.appendChild(lights);

    const zones =
        document.querySelectorAll(".reaction-zone");

    zones.forEach(zone => {

        zone.classList.remove("winner", "active");

        const text =
            zone.querySelector(".tap-text");

        if (text) text.textContent = "WAIT...";
    });

    if (message) {
        message.textContent =
            "WATCH THE FIVE RED LIGHTS";
    }

    const delay = randomInt(1800, 5000);

    addTimer(setTimeout(() => {

        if (!gameRunning) return;

        reactionReady = true;

        document.querySelectorAll(".reaction-dot")
            .forEach(dot => {
                dot.classList.remove("on");
            });

        zones.forEach(zone => {

            zone.classList.add("active");

            const text =
                zone.querySelector(".tap-text");

            if (text) text.textContent = "GO!";
        });

        if (message) {
            message.textContent =
                "LIGHTS OFF — TAP NOW!";
        }

        vibrate(40);

    }, delay));

    zones.forEach(zone => {

        zone.onpointerdown = function(e) {

            e.preventDefault();

            if (!gameRunning) return;

            const player =
                Number(zone.dataset.player);

            if (!reactionReady) {

                gameRunning = false;

                if (message) {
                    message.textContent =
                        `PLAYER ${player + 1} TOO EARLY!`;
                }

                vibrate(100);

                addTimer(setTimeout(() => {
                    startReactionRound();
                }, 900));

                return;
            }

            gameRunning = false;
            reactionReady = false;

            scores[player]++;

            zone.classList.remove("active");
            zone.classList.add("winner");

            const text =
                zone.querySelector(".tap-text");

            if (text) text.textContent = "WINNER!";

            const score =
                zone.querySelector(".score");

            if (score) {
                score.textContent =
                    `${scores[player]} / 5`;
            }

            if (message) {
                message.textContent =
                    `PLAYER ${player + 1} WINS THE POINT!`;
            }

            vibrate(50);

            if (scores[player] >= 5) {

                finishLater(
                    player,
                    "REACTION RACE",
                    "5 POINTS"
                );

            } else {

                addTimer(setTimeout(() => {
                    startReactionRound();
                }, 1000));
            }
        };
    });
}

/* 3 — TAP BATTLE */

function startTapBattle() {
    stopTimers();

    battlePower = 0;

    createTapBattle();

    runCountdown(() => {

        gameRunning = true;

        document.querySelectorAll(".battle-zone")
            .forEach(zone => {
                zone.addEventListener(
                    "pointerdown",
                    tapBattlePlayer,
                    {passive:false}
                );
            });
    });
}

function createTapBattle() {
    app.innerHTML = `
        <div class="game-screen tap-battle-screen">

            <div class="game-header">
                <h2>⚔️ TAP BATTLE</h2>
                <p>PUSH THE METER TO YOUR SIDE</p>
            </div>

            <div class="battle-meter">

                <div class="battle-fill"
                     id="battleFill">
                </div>

                <div class="battle-center">
                    BATTLE
                </div>

            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone battle-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="tap-text">
                            TAP!
                        </div>

                        <div class="score">
                            50%
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer">
                TAP TO PUSH THE BATTLE
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function tapBattlePlayer(e) {
    e.preventDefault();

    if (!gameRunning) return;

    const player =
        Number(e.currentTarget.dataset.player);

    const midpoint =
        (selectedPlayers - 1) / 2;

    let direction = 0;

    if (player < midpoint) {
        direction = -1;
    } else if (player > midpoint) {
        direction = 1;
    } else {
        direction = battlePower <= 0 ? 1 : -1;
    }

    battlePower += direction * 3;

    battlePower =
        Math.max(-100, Math.min(100, battlePower));

    updateBattleMeter();

    vibrate(8);

    if (Math.abs(battlePower) >= 100) {

        gameRunning = false;

        const winner =
            battlePower < 0
                ? 0
                : selectedPlayers - 1;

        finishLater(
            winner,
            "TAP BATTLE",
            "BATTLE WON"
        );
    }
}

function updateBattleMeter() {

    const fill =
        document.getElementById("battleFill");

    if (!fill) return;

    const percent =
        50 + battlePower / 2;

    fill.style.width =
        `${Math.max(0, Math.min(100, percent))}%`;

    document.querySelectorAll(".battle-zone")
        .forEach((zone,index) => {

            const score =
                zone.querySelector(".score");

            if (!score) return;

            if (index === 0) {
                score.textContent =
                    `${Math.round(50 - battlePower / 2)}%`;
            } else if (index === selectedPlayers - 1) {
                score.textContent =
                    `${Math.round(50 + battlePower / 2)}%`;
            } else {
                score.textContent = "HELP!";
            }
        });
}

/* END PART 1 */

/* 4 — TARGET SMASH */

function startTargetSmash() {
    stopTimers();

    scores = Array(selectedPlayers).fill(0);

    createTargetSmash();

    runCountdown(() => {
        gameRunning = true;
        spawnTarget();
    });
}

function createTargetSmash() {
    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>🎯 TARGET SMASH</h2>
                <p>FIRST TO 15 HITS WINS</p>
            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone target-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="target-score">
                            0 / 15
                        </div>

                        <div class="target-field"
                             data-player="${i}">
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer"
                 id="targetMessage">
                HIT THE TARGET!
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function spawnTarget() {

    if (!gameRunning) return;

    const fields =
        document.querySelectorAll(".target-field");

    fields.forEach(field => {

        field.innerHTML = "";

        const target =
            document.createElement("button");

        target.className = "target";
        target.textContent = "🎯";

        target.style.left =
            `${randomInt(15,75)}%`;

        target.style.top =
            `${randomInt(15,70)}%`;

        target.onpointerdown = function(e) {

            e.preventDefault();

            if (!gameRunning) return;

            const player =
                Number(field.dataset.player);

            scores[player]++;

            const zone =
                field.parentElement;

            const score =
                zone.querySelector(".target-score");

            if (score) {
                score.textContent =
                    `${scores[player]} / 15`;
            }

            target.remove();

            vibrate(15);

            if (scores[player] >= 15) {

                finishLater(
                    player,
                    "TARGET SMASH",
                    "15 HITS"
                );

                return;
            }

            spawnTarget();
        };

        field.appendChild(target);
    });
}

/* 5 — DASH DUEL */

function startDashDuel() {
    stopTimers();

    scores = Array(selectedPlayers).fill(0);

    createDashDuel();

    runCountdown(() => {

        gameRunning = true;

        document.querySelectorAll(".dash-zone")
            .forEach(zone => {
                zone.addEventListener(
                    "pointerdown",
                    dashPlayer,
                    {passive:false}
                );
            });
    });
}

function createDashDuel() {
    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>🏃 DASH DUEL</h2>
                <p>FIRST TO 100% WINS</p>
            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone dash-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="dash-track">
                            <div class="dash-progress"
                                 style="width:0%">
                            </div>
                        </div>

                        <div class="tap-text">
                            RUN!
                        </div>

                        <div class="score">
                            0%
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer">
                TAP RAPIDLY TO RUN
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function dashPlayer(e) {

    e.preventDefault();

    if (!gameRunning) return;

    const zone = e.currentTarget;

    const player =
        Number(zone.dataset.player);

    scores[player] =
        Math.min(100, scores[player] + 4);

    const progress =
        zone.querySelector(".dash-progress");

    const score =
        zone.querySelector(".score");

    if (progress) {
        progress.style.width =
            `${scores[player]}%`;
    }

    if (score) {
        score.textContent =
            `${scores[player]}%`;
    }

    vibrate(6);

    if (scores[player] >= 100) {

        finishLater(
            player,
            "DASH DUEL",
            "FINISH LINE"
        );
    }
}

/* 6 — COIN GRAB */

function startCoinGrab() {
    stopTimers();

    scores = Array(selectedPlayers).fill(0);

    createCoinGrab();

    runCountdown(() => {
        gameRunning = true;
        spawnCoins();
    });
}

function createCoinGrab() {
    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>🪙 COIN GRAB</h2>
                <p>FIRST TO 12 COINS WINS</p>
            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone coin-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="score">
                            0 / 12
                        </div>

                        <div class="coin-field"
                             data-player="${i}">
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer">
                GRAB THE COINS!
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function spawnCoins() {

    if (!gameRunning) return;

    const fields =
        document.querySelectorAll(".coin-field");

    fields.forEach(field => {

        field.innerHTML = "";

        const coin =
            document.createElement("button");

        coin.className = "coin";
        coin.textContent = "🪙";

        coin.style.left =
            `${randomInt(15,75)}%`;

        coin.style.top =
            `${randomInt(20,70)}%`;

        coin.onpointerdown = function(e) {

            e.preventDefault();

            if (!gameRunning) return;

            const player =
                Number(field.dataset.player);

            scores[player]++;

            const zone =
                field.parentElement;

            const score =
                zone.querySelector(".score");

            if (score) {
                score.textContent =
                    `${scores[player]} / 12`;
            }

            coin.remove();

            vibrate(12);

            if (scores[player] >= 12) {

                finishLater(
                    player,
                    "COIN GRAB",
                    "12 COINS"
                );

                return;
            }

            spawnCoins();
        };

        field.appendChild(coin);
    });
}

/* END PART 2 */

/* 7 — QUICK CHOICE */

const choiceSymbols = [
    "▲",
    "●",
    "■",
    "★"
];

function startQuickChoice() {
    stopTimers();

    scores = Array(selectedPlayers).fill(0);

    createQuickChoice();

    runCountdown(() => {
        gameRunning = true;
        nextChoiceRound();
    });
}

function createQuickChoice() {

    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">
                <h2>🧠 QUICK CHOICE</h2>
                <p>FIRST TO 10 POINTS WINS</p>
            </div>

            <div class="choice-target"
                 id="choiceTarget">
                ?
            </div>

            <div class="players-area players-${selectedPlayers}">

                ${Array.from({length:selectedPlayers}, (_,i) => `
                    <div class="tap-zone choice-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="choice-buttons">

                            ${choiceSymbols.map(symbol => `
                                <button class="choice-button"
                                        data-symbol="${symbol}">
                                    ${symbol}
                                </button>
                            `).join("")}

                        </div>

                        <div class="score">
                            0 / 10
                        </div>

                    </div>
                `).join("")}

            </div>

            <div class="game-footer"
                 id="choiceMessage">
                CHOOSE THE MATCHING SYMBOL
            </div>

            ${gameCountdownHTML()}

        </div>
    `;
}

function nextChoiceRound() {

    if (!gameRunning) return;

    const target =
        choiceSymbols[
            randomInt(0, choiceSymbols.length - 1)
        ];

    const targetElement =
        document.getElementById("choiceTarget");

    if (targetElement) {
        targetElement.textContent = target;
    }

    document.querySelectorAll(".choice-button")
        .forEach(button => {

            button.onclick = function(e) {

                e.preventDefault();

                if (!gameRunning) return;

                const zone =
                    button.closest(".choice-zone");

                const player =
                    Number(zone.dataset.player);

                if (button.dataset.symbol === target) {

                    scores[player]++;

                    const score =
                        zone.querySelector(".score");

                    if (score) {
                        score.textContent =
                            `${scores[player]} / 10`;
                    }

                    zone.classList.add("winner");

                    vibrate(20);

                    setTimeout(() => {
                        zone.classList.remove("winner");
                    }, 150);

                    if (scores[player] >= 10) {

                        finishLater(
                            player,
                            "QUICK CHOICE",
                            "10 POINTS"
                        );

                    } else {

                        nextChoiceRound();
                    }

                } else {

                    zone.classList.add("pressed");

                    setTimeout(() => {
                        zone.classList.remove("pressed");
                    }, 120);

                    vibrate(60);
                }
            };
        });
}

/* FINISH SCREEN */

function finishGame(player, title, subtitle) {

    stopTimers();

    app.innerHTML = `
        <div class="winner-screen">

            <div class="winner-icon">
                🏆
            </div>

            <div class="winner-label">
                WINNER
            </div>

            <div class="winner-player">
                PLAYER ${player + 1}
            </div>

            <div class="winner-game">
                ${title}
            </div>

            <div class="winner-subtitle">
                ${subtitle}
            </div>

            <div class="winner-buttons">

                <button onclick="startGame(${games.findIndex(g => g.name === title)})">
                    PLAY AGAIN
                </button>

                <button onclick="showGameSelect()">
                    GAME LIBRARY
                </button>

                <button onclick="showHome()">
                    HOME
                </button>

            </div>

        </div>
    `;
}

/* CUP */

function showTournament() {

    stopTimers();

    app.innerHTML = `
        <div class="select-page">

            <div class="topbar">

                <button class="back-btn"
                        onclick="showHome()">
                    ← BACK
                </button>

                <div>
                    <div class="top-title">
                        🏆 PARTY CUP
                    </div>

                    <div class="top-subtitle">
                        LOCAL TOURNAMENT
                    </div>
                </div>

                <div></div>

            </div>

            <div class="select-content">

                <h1 class="section-title">
                    PARTY CUP
                </h1>

                <p class="section-subtitle">
                    Tournament mode is coming next.
                </p>

                <div class="game-card"
                     onclick="choosePlayers(2)">

                    <div class="game-icon">
                        🏆
                    </div>

                    <h3>START PARTY CUP</h3>

                    <p>
                        Choose players and play the mini-games.
                    </p>

                    <div class="play-label">
                        START →
                    </div>

                </div>

            </div>

        </div>
    `;
}

/* START */

showHome();

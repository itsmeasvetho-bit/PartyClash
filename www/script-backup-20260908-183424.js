const app = document.getElementById("app");

let selectedPlayers = 2;
let gameRunning = false;
let scores = [];
let reactionReady = false;
let reactionTimer = null;

/* =========================
   GAME LIBRARY
========================= */

const games = [
    {
        name: "Tap Rush",
        icon: "⚡",
        description: "Tap as fast as you can. First player to reach 50 wins."
    },
    {
        name: "Reaction Race",
        icon: "🚦",
        description: "Watch the five red lights. When they go OFF, tap first!"
    },
    {
        name: "Tap Battle",
        icon: "⚔️",
        description: "Tap your zone to push the battle meter. First to 100% wins."
    }
];

/* =========================
   HOME
========================= */

function showHome() {
    stopTimers();

    app.innerHTML = `
        <div class="home">

            <div class="logo">
                <strong>PARTY CLASH</strong>
                <span>LOCAL MULTIPLAYER</span>
            </div>

            <div class="home-status">
                <div class="home-status-title">
                    PARTY CLASH
                </div>

                <div class="home-status-text">
                    CHOOSE PLAYERS
                </div>
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

/* =========================
   PLAYER SELECT
========================= */

function choosePlayers(count) {
    selectedPlayers = count;
    showGameSelect();
}

/* =========================
   GAME LIBRARY
========================= */

function showGameSelect() {
    const cards = games.map((game, index) => `
        <div class="game-card" onclick="startGame(${index})">

            <div class="game-icon">
                ${game.icon}
            </div>

            <h3>${game.name}</h3>

            <p>
                ${game.description}
            </p>

            <div class="play-label">
                PLAY →
            </div>

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
                    <div class="top-title">
                        GAME LIBRARY
                    </div>

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

/* =========================
   START GAME
========================= */

function startGame(index) {

    if (index === 0) {
        startTapRush();
        return;
    }

    if (index === 1) {
        startReactionRace();
        return;
    }

    if (index === 2) {
        startTapBattle();
        return;
    }
}

/* =========================
   TAP RUSH
========================= */

function startTapRush() {

    stopTimers();

    gameRunning = false;
    scores = Array(selectedPlayers).fill(0);

    createTapPlayers();

    runCountdown(() => {

        gameRunning = true;

        activateTapTouch();

    });
}

function createTapPlayers() {

    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">

                <h2>⚡ TAP RUSH</h2>

                <p>
                    FIRST TO 50 TAPS WINS
                </p>

            </div>

            <div class="players-area players-${selectedPlayers}"
                 id="playersArea">

                ${Array.from(
                    { length: selectedPlayers },
                    (_, i) => `
                    <div class="tap-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="tap-text">
                            TAP!
                        </div>

                        <div class="score">
                            0 / 50
                        </div>

                    </div>
                `
                ).join("")}

            </div>

            <div class="game-footer">
                TAP ANYWHERE INSIDE YOUR PLAYER AREA
            </div>

            <div class="countdown"
                 id="countdown">

                <div class="countdown-number"
                     id="countdownNumber">
                    3
                </div>

            </div>

        </div>
    `;
}

function activateTapTouch() {

    document.querySelectorAll(".tap-zone")
        .forEach(zone => {

            zone.addEventListener(
                "pointerdown",
                tapPlayer,
                { passive: false }
            );

        });
}

function tapPlayer(e) {

    e.preventDefault();

    if (!gameRunning) return;

    const zone = e.currentTarget;

    const player =
        Number(zone.dataset.player);

    scores[player]++;

    zone.querySelector(".score")
        .textContent =
        `${scores[player]} / 50`;

    zone.classList.add("pressed");

    setTimeout(() => {
        zone.classList.remove("pressed");
    }, 80);

    if (scores[player] >= 50) {

        gameRunning = false;

        zone.classList.add("winner");

        zone.querySelector(".tap-text")
            .textContent = "WINNER!";

        zone.querySelector(".score")
            .textContent = "50 / 50";

        setTimeout(() => {

            finishGame(
                player,
                "TAP RUSH",
                "50 TAPS"
            );

        }, 1000);
    }
}

/* =========================
   REACTION RACE
========================= */

function startReactionRace() {

    stopTimers();

    gameRunning = false;
    reactionReady = false;

    scores = Array(selectedPlayers).fill(0);

    createReactionPlayers();

    runCountdown(() => {

        startReactionRound();

    });
}

function createReactionPlayers() {

    app.innerHTML = `
        <div class="game-screen">

            <div class="game-header">

                <h2>🚦 REACTION RACE</h2>

                <p>
                    FIRST TO 5 POINTS WINS
                </p>

            </div>

            <div class="players-area players-${selectedPlayers}"
                 id="playersArea">

                ${Array.from(
                    { length: selectedPlayers },
                    (_, i) => `
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
                `
                ).join("")}

            </div>

            <div class="game-footer"
                 id="reactionMessage">

                WAIT FOR THE LIGHTS

            </div>

            <div class="countdown"
                 id="countdown">

                <div class="countdown-number"
                     id="countdownNumber">
                    3
                </div>

            </div>

        </div>
    `;
}

/* =========================
   REACTION ROUND
   FIVE RED LIGHTS
========================= */

function startReactionRound() {

    stopTimers();

    reactionReady = false;
    gameRunning = true;

    const zones =
        document.querySelectorAll(".reaction-zone");

    const message =
        document.getElementById("reactionMessage");

    /* Create the five center lights */

    const oldLights =
        document.querySelector(".reaction-lights");

    if (oldLights) {
        oldLights.remove();
    }

    const lights =
        document.createElement("div");

    lights.className =
        "reaction-lights";

    lights.innerHTML = `
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
        <span class="reaction-dot on"></span>
    `;

    document.querySelector(".game-screen")
        .appendChild(lights);

    zones.forEach(zone => {

        zone.classList.remove(
            "winner",
            "active"
        );

        zone.querySelector(".tap-text")
            .textContent = "WAIT...";

    });

    message.textContent =
        "WATCH THE FIVE RED LIGHTS";

    /*
       Lights stay ON for a random time.
       Then ALL FIVE switch OFF.
    */

    const delay =
        1800 + Math.random() * 3200;

    reactionTimer = setTimeout(() => {

        if (!gameRunning) return;

        reactionReady = true;

        document
            .querySelectorAll(".reaction-dot")
            .forEach(dot => {
                dot.classList.remove("on");
            });

        zones.forEach(zone => {

            zone.classList.add("active");

            zone.querySelector(".tap-text")
                .textContent = "GO!";

        });

        message.textContent =
            "LIGHTS OFF — TAP NOW!";

    }, delay);

    /* Player controls */

    zones.forEach(zone => {

        zone.onpointerdown = function(e) {

            e.preventDefault();

            if (!gameRunning) return;

            const player =
                Number(zone.dataset.player);

            /*
               Too early
            */

            if (!reactionReady) {

                gameRunning = false;

                clearTimeout(reactionTimer);

                message.textContent =
                    `PLAYER ${player + 1} TOO EARLY!`;

                setTimeout(() => {

                    startReactionRound();

                }, 900);

                return;
            }

            /*
               Correct reaction
            */

            gameRunning = false;
            reactionReady = false;

            clearTimeout(reactionTimer);

            scores[player]++;

            zone.classList.remove("active");
            zone.classList.add("winner");

            zone.querySelector(".tap-text")
                .textContent = "WINNER!";

            zone.querySelector(".score")
                .textContent =
                `${scores[player]} / 5`;

            message.textContent =
                `PLAYER ${player + 1} WINS THE POINT!`;

            /*
               FIRST TO FIVE
            */

            setTimeout(() => {

                if (scores[player] >= 5) {

                    finishGame(
                        player,
                        "REACTION RACE",
                        "5 POINTS"
                    );

                } else {

                    startReactionRound();

                }

            }, 1000);

        };

    });
}


/* =========================
   TAP BATTLE
========================= */

let battlePower = 0;
let battleWinner = -1;

function startTapBattle() {

    stopTimers();

    gameRunning = false;
    battlePower = 0;
    battleWinner = -1;

    createTapBattle();

    runCountdown(() => {

        gameRunning = true;
        activateTapBattle();

    });
}

function createTapBattle() {

    app.innerHTML = `
        <div class="game-screen tap-battle-screen">

            <div class="game-header">

                <h2>⚔️ TAP BATTLE</h2>

                <p>
                    FIRST TO 100% WINS
                </p>

            </div>

            <div class="battle-meter">

                <div class="battle-fill"
                     id="battleFill"></div>

                <div class="battle-center">
                    BATTLE
                </div>

            </div>

            <div class="players-area players-${selectedPlayers}"
                 id="playersArea">

                ${Array.from(
                    { length: selectedPlayers },
                    (_, i) => `
                    <div class="tap-zone battle-zone"
                         data-player="${i}">

                        <div class="player-number">
                            PLAYER ${i + 1}
                        </div>

                        <div class="tap-text">
                            TAP!
                        </div>

                        <div class="score">
                            0%
                        </div>

                    </div>
                `
                ).join("")}

            </div>

            <div class="game-footer">
                TAP YOUR AREA TO PUSH THE BATTLE
            </div>

            <div class="countdown"
                 id="countdown">

                <div class="countdown-number"
                     id="countdownNumber">
                    3
                </div>

            </div>

        </div>
    `;
}

function activateTapBattle() {

    document.querySelectorAll(".battle-zone")
        .forEach(zone => {

            zone.addEventListener(
                "pointerdown",
                battleTap,
                { passive: false }
            );

        });
}

function battleTap(e) {

    e.preventDefault();

    if (!gameRunning) return;

    const zone = e.currentTarget;
    const player = Number(zone.dataset.player);

    /*
       Every tap moves the battle toward
       the player who tapped.
    */

    const step = 2;

    if (player === 0) {

        battlePower -= step;

    } else {

        battlePower += step;

    }

    /*
       Keep the meter inside its limits.
    */

    battlePower = Math.max(
        -100,
        Math.min(100, battlePower)
    );

    updateBattleMeter();

    zone.classList.add("pressed");

    setTimeout(() => {
        zone.classList.remove("pressed");
    }, 80);

    /*
       Left side wins.
    */

    if (battlePower <= -100) {

        finishTapBattle(0);
        return;

    }

    /*
       Right side wins.
    */

    if (battlePower >= 100) {

        finishTapBattle(selectedPlayers - 1);
        return;

    }
}

function updateBattleMeter() {

    const fill =
        document.getElementById("battleFill");

    if (!fill) return;

    const percentage =
        ((battlePower + 100) / 200) * 100;

    fill.style.width =
        percentage + "%";

    /*
       Update player percentages.
    */

    const zones =
        document.querySelectorAll(".battle-zone");

    zones.forEach((zone, index) => {

        const score =
            zone.querySelector(".score");

        if (!score) return;

        if (index === 0) {

            score.textContent =
                Math.max(0, -battlePower) + "%";

        } else if (index === selectedPlayers - 1) {

            score.textContent =
                Math.max(0, battlePower) + "%";

        } else {

            score.textContent = "READY";

        }

    });
}

function finishTapBattle(player) {

    gameRunning = false;
    battleWinner = player;

    const zones =
        document.querySelectorAll(".battle-zone");

    zones.forEach(zone => {

        zone.classList.remove("pressed");

    });

    const winnerZone = zones[player];

    if (winnerZone) {

        winnerZone.classList.add("winner");

        winnerZone.querySelector(".tap-text")
            .textContent = "WINNER!";

        winnerZone.querySelector(".score")
            .textContent = "100%";

    }

    setTimeout(() => {

        finishGame(
            player,
            "TAP BATTLE",
            "100% POWER"
        );

    }, 900);
}

/* =========================
   COUNTDOWN
========================= */

function runCountdown(callback) {

    const overlay =
        document.getElementById("countdown");

    const number =
        document.getElementById("countdownNumber");

    if (!overlay || !number) {

        callback();
        return;

    }

    let count = 3;

    number.textContent = count;

    const timer =
        setInterval(() => {

            count--;

            if (count <= 0) {

                clearInterval(timer);

                overlay.remove();

                callback();

                return;

            }

            number.textContent = count;

        }, 700);
}

/* =========================
   FINISH GAME
========================= */

function finishGame(
    player,
    gameName,
    result
) {

    stopTimers();

    gameRunning = false;

    app.innerHTML = `
        <div class="winner-screen">

            <div class="winner-icon">
                🏆
            </div>

            <h1>
                PLAYER ${player + 1} WINS!
            </h1>

            <p>
                ${gameName}<br>
                ${result}
            </p>

            <button class="main-btn"
                    onclick="showGameSelect()">
                PLAY AGAIN
            </button>

            <br>

            <button class="main-btn"
                    onclick="showHome()">
                HOME
            </button>

        </div>
    `;
}

/* =========================
   TOURNAMENT
========================= */

function showTournament() {

    app.innerHTML = `
        <div class="tournament">

            <div class="topbar">

                <button class="back-btn"
                        onclick="showHome()">
                    ← BACK
                </button>

                <div class="top-title">
                    TOURNAMENT
                </div>

                <div></div>

            </div>

            <div class="trophy">
                🏆
            </div>

            <h1>
                PARTY CUP
            </h1>

            <p>
                Compete through multiple mini-games
                and become the ultimate Party Clash
                champion.
            </p>

            <button class="main-btn"
                    onclick="showHome()">
                BACK TO HOME
            </button>

        </div>
    `;
}

/* =========================
   CLEANUP
========================= */

function stopTimers() {

    if (reactionTimer) {

        clearTimeout(reactionTimer);

        reactionTimer = null;

    }

    gameRunning = false;
    reactionReady = false;
}

/* =========================
   START APP
========================= */

showHome();

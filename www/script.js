const app = document.getElementById("app");

let selectedPlayers = 2;

const games = [
    {
        name: "Island Panic",
        icon: "🏝️",
        description: "Stay alive as the island disappears.",
        tag: "2D SURVIVAL"
    }
];

function showHome() {
    app.innerHTML = `
        <main class="home-page">
            <section class="hero">
                <div class="logo-mark">PC</div>
                <div class="eyebrow">LOCAL MULTIPLAYER</div>
                <h1>PARTY CLASH</h1>
                <p>Fast games. Big clashes.</p>
                <button class="primary-btn" onclick="showPlayerSelect()">
                    PLAY NOW
                </button>
            </section>
        </main>
    `;
}

function showPlayerSelect() {
    app.innerHTML = `
        <main class="select-page">
            <section class="select-content">
                <div class="page-label">PARTY SETUP</div>
                <h1>HOW MANY PLAYERS?</h1>
                <p class="subtitle">Everyone plays on the same device.</p>

                <div class="player-options">

                    <button class="player-card" onclick="choosePlayers(2)">
                        <span class="player-number">2</span>
                        <span class="player-label">PLAYERS</span>
                    </button>

                    <button class="player-card" onclick="choosePlayers(3)">
                        <span class="player-number">3</span>
                        <span class="player-label">PLAYERS</span>
                    </button>

                    <button class="player-card" onclick="choosePlayers(4)">
                        <span class="player-number">4</span>
                        <span class="player-label">PLAYERS</span>
                    </button>

                </div>

                <button class="back-btn" onclick="showHome()">← BACK</button>
            </section>
        </main>
    `;
}

function choosePlayers(count) {
    selectedPlayers = count;
    showGameSelect();
}

function showGameSelect() {

    app.innerHTML = `
        <main class="select-page">
            <section class="select-content">

                <div class="page-top">
                    <button class="back-btn" onclick="showPlayerSelect()">← BACK</button>
                    <div class="players-badge">
                        ${selectedPlayers} PLAYERS
                    </div>
                </div>

                <div class="page-label">GAME LIBRARY</div>

                <h1>CHOOSE YOUR CLASH</h1>

                <p class="subtitle">
                    New 2D games are coming.
                </p>

                <div class="games-grid">

                    ${games.map((game, index) => `
                        <button class="game-card"
                                onclick="startGame(${index})">

                            <div class="game-icon">
                                ${game.icon}
                            </div>

                            <div class="game-info">
                                <div class="game-tag">
                                    ${game.tag}
                                </div>

                                <h2>${game.name}</h2>

                                <p>${game.description}</p>
                            </div>

                            <div class="game-arrow">→</div>

                        </button>
                    `).join("")}

                </div>

            </section>
        </main>
    `;
}

function startGame(index) {

    const game = games[index];

    if (game.name === "Island Panic") {
        startIslandPanic();
    }
}

function startIslandPanic() {

    /*
     * The standalone Island Panic prototype
     * is island.html.
     *
     * For now we open it directly so we can
     * test the new 2D game safely.
     */

    window.location.href =
        "island.html?players=" + selectedPlayers;
}

showHome();

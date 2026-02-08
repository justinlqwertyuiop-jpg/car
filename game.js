const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const roadWidth = 260;
const laneCount = 3;
const laneWidth = roadWidth / laneCount;
const roadX = (canvas.width - roadWidth) / 2;

let gameOver = false;
let score = 0;
let speed = 4;

const player = {
  width: 40,
  height: 70,
  lane: 1, // 0,1,2
  y: canvas.height - 100,
  color: "#00ff00",
};

const enemies = [];
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keys[e.key] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keys[e.key] = false;
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  gameOver = false;
  score = 0;
  speed = 4;
  enemies.length = 0;
  player.lane = 1;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  loop();
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * laneCount);
  enemies.push({
    lane,
    y: -80,
    width: 40,
    height: 70,
    color: "#ff0000",
  });
}

let enemySpawnTimer = 0;
const enemySpawnInterval = 60; // frames

function update() {
  if (gameOver) return;

  // Handle input
  if (keys.ArrowLeft && player.lane > 0) {
    player.lane--;
    keys.ArrowLeft = false;
  }
  if (keys.ArrowRight && player.lane < laneCount - 1) {
    player.lane++;
    keys.ArrowRight = false;
  }

  // Spawn enemies
  enemySpawnTimer++;
  if (enemySpawnTimer >= enemySpawnInterval) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  // Move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += speed;

    // Remove off-screen enemies and increase score
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      score++;
      document.getElementById("score").textContent = score;

      // Gradually increase speed
      if (score % 5 === 0) {
        speed += 0.5;
      }
    }
  }

  // Check collisions
  const playerX = roadX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  const playerY = player.y;

  for (const enemy of enemies) {
    const enemyX = roadX + enemy.lane * laneWidth + (laneWidth - enemy.width) / 2;
    const enemyY = enemy.y;

    if (
      playerX < enemyX + enemy.width &&
      playerX + player.width > enemyX &&
      playerY < enemyY + enemy.height &&
      playerY + player.height > enemyY
    ) {
      gameOver = true;
      document.getElementById("restartBtn").style.display = "inline-block";
      break;
    }
  }
}

function drawRoad() {
  // Road background
  ctx.fillStyle = "#333";
  ctx.fillRect(roadX, 0, roadWidth, canvas.height);

  // Lane lines
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  for (let i = 1; i < laneCount; i++) {
    const x = roadX + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawPlayer() {
  const x = roadX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  const y = player.y;
  ctx.fillStyle = player.color;
  ctx.fillRect(x, y, player.width, player.height);
}

function drawEnemies() {
  for (const enemy of enemies) {
    const x = roadX + enemy.lane * laneWidth + (laneWidth - enemy.width) / 2;
    const y = enemy.y;
    ctx.fillStyle = enemy.color;
    ctx.fillRect(x, y, enemy.width, enemy.height);
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
  ctx.fillText("Click Restart to play again", canvas.width / 2, canvas.height / 2 + 45);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  drawPlayer();
  drawEnemies();
  if (gameOver) {
    drawGameOver();
  }
}

function loop() {
  update();
  render();
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

// Start the game
loop();

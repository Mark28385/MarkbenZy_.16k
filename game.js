// ตั้งค่า Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// === ตัวแปรเกม ===
let gameLoop;
let score = 0;
let isGameOver = false;

// === ตัวละคร (Player) ===
const player = {
    x: 50,
    y: canvas.height - 70, // ตำแหน่งเริ่มต้นบนพื้น
    width: 20,
    height: 20,
    color: '#ff5733', // สีตัวละคร
    dy: 0, // ความเร่งในแนวตั้ง (Gravity)
    jumpPower: -12, // แรงกระโดด
    isJumping: false
};

const gravity = 0.5;
const groundY = canvas.height - 50; // ตำแหน่งพื้น

// === สิ่งกีดขวาง (Obstacles) ===
let obstacles = [];
let obstacleSpeed = 4;
let spawnRate = 150; // Spawn every 150 frames (ยิ่งน้อยยิ่งเร็ว)

// === ฟังก์ชันการวาด ===
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
    ctx.fillStyle = '#4caf50'; // สีพื้นดิน
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

function drawObstacles() {
    ctx.fillStyle = '#333';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

// === ฟังก์ชันอัปเดตสถานะเกม (Game Loop) ===
function update() {
    if (isGameOver) {
        return;
    }

    // 1. เคลียร์ Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();

    // 2. อัปเดตตัวละคร (Player Update)
    
    // ใช้แรงโน้มถ่วง
    player.dy += gravity; 
    player.y += player.dy;

    // ตรวจสอบการลงพื้น
    if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
        player.dy = 0;
        player.isJumping = false;
    }

    drawPlayer();

    // 3. อัปเดตสิ่งกีดขวาง (Obstacle Update)
    
    // เคลื่อนที่สิ่งกีดขวาง
    obstacles.forEach(obs => {
        obs.x -= obstacleSpeed;
    });

    // กำจัดสิ่งกีดขวางที่ออกจากหน้าจอ
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
    drawObstacles();

    // 4. สร้างสิ่งกีดขวางใหม่ (Spawn Obstacle)
    
    // ตรวจสอบทุกเฟรมตามค่า spawnRate
    if (Math.random() * spawnRate < 1) { 
        // สุ่มขนาดและความสูงของสิ่งกีดขวาง
        const obsWidth = 20;
        const obsHeight = 20 + Math.random() * 20;
        
        obstacles.push({
            x: canvas.width,
            y: groundY - obsHeight,
            width: obsWidth,
            height: obsHeight
        });
    }
    
    // 5. การชน (Collision Detection)
    if (checkCollision()) {
        gameOver();
        return;
    }

    // 6. อัปเดตคะแนน
    score++;
    scoreDisplay.textContent = Math.floor(score / 10); // หาร 10 เพื่อให้คะแนนไม่ขึ้นเร็วเกินไป

    // เรียกตัวเองซ้ำเพื่อให้เกิดการเคลื่อนไหว
    gameLoop = requestAnimationFrame(update);
}

// === ฟังก์ชันการชน (Collision) ===
function checkCollision() {
    let collision = false;
    obstacles.forEach(obs => {
        // AABB Collision Detection (สำหรับสี่เหลี่ยม)
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            collision = true;
        }
    });
    return collision;
}

// === ฟังก์ชันการกระโดด (Jump Logic) ===
function jump() {
    if (!player.isJumping) {
        player.isJumping = true;
        player.dy = player.jumpPower;
    }
}

// === ฟังก์ชัน Game Over ===
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`คะแนนสุดท้าย: ${Math.floor(score / 10)}`, canvas.width / 2, canvas.height / 2 + 50);
}

// === การควบคุม (Event Listener) ===
// กระโดดเมื่อกด Spacebar หรือคลิก
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        jump();
    }
});

canvas.addEventListener('click', jump);


// === เริ่มเกม ===
function startGame() {
    // รีเซ็ตค่าต่างๆ
    score = 0;
    isGameOver = false;
    obstacles = [];
    player.y = groundY - player.height;
    player.dy = 0;
    
    // เริ่ม Game Loop
    update();
}

startGame(); // เรียกฟังก์ชันเริ่มต้นเกม
// ... (โค้ดเกมเดิม) ...

// === การจัดการหน้าเมนูผู้จัดทำ (Credits) ===
const creditsScreen = document.getElementById('credits-screen');
const openCreditsButton = document.getElementById('open-credits');
const closeCreditsButton = document.getElementById('close-credits');

// ฟังก์ชันสำหรับเปิดหน้า Credits
function openCredits() {
    // 1. ซ่อน/หยุด Canvas (ถ้าเกมกำลังเล่น)
    if (!isGameOver) {
        cancelAnimationFrame(gameLoop); // หยุด Game Loop
    }
    
    // 2. แสดงหน้า Credits
    creditsScreen.classList.add('active');
}

// ฟังก์ชันสำหรับปิดหน้า Credits
function closeCredits() {
    creditsScreen.classList.remove('active');
    
    // 3. กลับไปที่หน้าหลัก หรือเริ่มเกมต่อ (ถ้าต้องการ)
    if (!isGameOver) {
        // หากเกมไม่ได้จบ ให้เริ่ม Game Loop ต่อ
        gameLoop = requestAnimationFrame(update); 
    }
}

// Event Listeners สำหรับปุ่ม
openCreditsButton.addEventListener('click', openCredits);
closeCreditsButton.addEventListener('click', closeCredits);


// ... (โค้ด Game Loop และ Event Listeners เดิม) ...
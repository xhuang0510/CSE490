let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  };

// Canvas dimensions
const WIDTH = 1000;
const HEIGHT = 700;

// Sword images
let swordRight;
let swordLeft;
let swordUp;
let swordDown;

// Bow images
let bowRight;
let bowLeft;
let bowUp;
let bowDown;

// Wand images
let wandRight;
let wandLeft;
let wandUp;
let wandDown;

// Heal effect
let healEffect;

// Boomerang images
let rangRight;
let rangLeft;
let rangUp;
let rangDown;

// Arrow images
let arrowRight;
let arrowLeft;
let arrowUp;
let arrowDown;

// Fire spell image
let fireImg;

// Preload images
function preload() {
  // Load sword images
  swordRight = loadImage('assets/sword_right.png');
  swordLeft = loadImage('assets/sword_left.png');
  swordUp = loadImage('assets/sword_up.png');
  swordDown = loadImage('assets/sword_down.png');
  // Load bow images
  bowRight = loadImage('assets/bow_right.png');
  bowLeft = loadImage('assets/bow_left.png');
  bowUp = loadImage('assets/bow_up.png');
  bowDown = loadImage('assets/bow_down.png');
  // Load wand images
  wandRight = loadImage('assets/wand_right.png');
  wandLeft = loadImage('assets/wand_left.png');
  wandUp = loadImage('assets/wand_up.png');
  wandDown = loadImage('assets/wand_down.png');
  // Load heal animation
  healEffect = loadImage('assets/heal.gif');
  // Load boomerang images
  rangRight = loadImage('assets/rang_right.png');
  rangLeft = loadImage('assets/rang_left.png');
  rangUp = loadImage('assets/rang_up.png');
  rangDown = loadImage('assets/rang_down.png');
  // Load arrow images
  arrowRight = loadImage('assets/arrow_right.png');
  arrowLeft = loadImage('assets/arrow_left.png');
  arrowUp = loadImage('assets/arrow_up.png');
  arrowDown = loadImage('assets/arrow_down.png');
  // Load fire spell
  fireImg = loadImage('assets/fire.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);

  // Resize sowrd images
  swordRight.resize(120, 75);
  swordLeft.resize(120, 75);
  swordUp.resize(75, 120);
  swordDown.resize(75, 120);

  // Resize bow images
  bowRight.resize(100, 100);
  bowLeft.resize(100, 100);
  bowUp.resize(100, 100);
  bowDown.resize(100, 100);

  // Resize wand images
  wandRight.resize(60, 60);
  wandLeft.resize(60, 60);
  wandUp.resize(60, 60);
  wandDown.resize(60, 60);

  // Resize heal effect
  healEffect.resize(100, 100);

  // Resize boomerang images
  rangRight.resize(50, 50);
  rangLeft.resize(50, 50);
  rangUp.resize(50, 50);
  rangDown.resize(50, 50);

  // Resize arrow images
  arrowRight.resize(75, 75);
  arrowLeft.resize(75, 75);
  arrowUp.resize(75, 75);
  arrowDown.resize(75, 75);

  // Resize fire image
  fireImg.resize(75, 75);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
}

// Game constants
const MOVE_STEP = 5;
const CHAR_DIAM = 50;

// Track the game state
let gameState = 0;

// Track player health
let maxHealth = 3;
let health = 3;

// Track player position
let xPos = WIDTH / 2;
let yPos = HEIGHT / 2;

// Track which direction player is facing
// 0 = up, 1 = left, 2 = down, 3 = right
let face = 2;

// Track player weapon
let weapon = 0;
let weaponActive = false;

// Track player map position
let map = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
];
let mapX = 1;
let mapY = 1;

// Used for smooth movement
let right = false;
let left = false;
let up = false;
let down = false;

// Used to track user projectiles
let userProj = [];

// Used to track enemy projectiles
let enemyProj = [];

// Track active states of items
let spellState = true;
let rangState = true;
let potionState = true;
let bowState = 0;
let healState = 0;

function draw() {
  background(124, 175, 98);
  stroke(0);
  fill(200); 
  textSize(64);

  // On menu screen
  if (gameState == 0) {
    fill(250); 
    text("Hero Simulator", (width / 4) + 16, height / 4);

    // Insert some artwork here

    // If user has not connected serial
    textSize(32);
    if (!serial.isOpen()) {
        text("Click to Connect to Serial!", (width / 4) + 45, height - 150);
    } else { // Player connected serial, display play button
        text("Play", (width / 2) - 45, height - 150);
    }
  } else if (gameState == 1) { // In game
    // Display the gameplay
    displayGame();
  } else { // Game over
    text("Game Over", (width / 4) + 45, height - 150);
  }
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  weapon = newData;
}

function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}

// Take in key press events
document.addEventListener('keydown', function(e) {
    if(e.code == "Space") { // Space key
        // If on menu screen, start game
        if (gameState == 0) {
            gameState++;
        } else if (gameState == 1) { // In game
            console.log("mapX: " + mapX);
            console.log("mapY: " + mapY);
            health--;
            if (health == 0) {
                gameState++;
            }
        } else { // On game over screen
            gameState = 0;
        }
    } 
    if (e.code == "KeyW") { // W key
        up = true;
        face = 0;
    } else if (e.code == "KeyA") { // A key
        left = true;
        face = 1;
    } else if (e.code == "KeyS") { // S key
        down = true;
        face = 2;
    } else if (e.code == "KeyD") { // D key
        right = true;
        face = 3;
    }
});

// Take in key press events
document.addEventListener('keyup', function(e) {
    if(e.code == "Space") { // Space key
        
    } 
    if (e.code == "KeyW") { // W key
        up = false;
    } else if (e.code == "KeyA") { // A key
        left = false;
    } else if (e.code == "KeyS") { // S key
        down = false;
    } else if (e.code == "KeyD") { // D key
        right = false;
    }
});

// Update player position
function updatePos() {
    if (gameState == 1) {
        if (left) {
            // If player crosses left area boundary
            if (xPos == CHAR_DIAM / 2 && mapX > 0) {
                mapX--;
                xPos = WIDTH - CHAR_DIAM;
                updateSerial();
                resetProjectiles();
            } else if (xPos > CHAR_DIAM / 2) { // other movement
                xPos -= MOVE_STEP;
            } 
        } else if (right) {
            // If player crosses right area boundary
            if (xPos == WIDTH - (CHAR_DIAM / 2) && mapX < map[0].length - 1) {
                mapX++;
                xPos = CHAR_DIAM / 2;
                updateSerial();
                resetProjectiles();
            } else if (xPos < WIDTH - CHAR_DIAM / 2) {
                xPos += MOVE_STEP;
            }
        } else if (up) {
            // If a player crosses upper area boundary
            if (yPos == CHAR_DIAM / 2 && mapY > 0) {
                mapY--;
                yPos = HEIGHT - CHAR_DIAM;
                updateSerial();
                resetProjectiles();
            } else if (yPos > CHAR_DIAM / 2) {
                yPos -= MOVE_STEP;
            }
        } else if (down) {
            // If player crosses lower area boundary
            if (yPos == HEIGHT - (CHAR_DIAM / 2) && mapY < map.length - 1) {
                mapY++;
                yPos = CHAR_DIAM / 2;
                updateSerial();
                resetProjectiles();
            } else if (yPos < HEIGHT - CHAR_DIAM / 2) {
                yPos += MOVE_STEP;
            }
        }
    }
}

// User clicks mouse
document.body.addEventListener("mousedown", function(e) {
    weaponActive = true;
    if (weapon == 2 && spellState) { // Wand
        userProj.push({
            name: "flame",
            projX: xPos,
            projY: yPos,
            direc: face,
            lifeTime: 300,
            travelCount: 0,
            valid: true
        });
        spellState = false;
        fireImg.resize(75, 75);
    } else if (weapon == 3 && healState == 0) { // Heal
        healState = 1;
        health += 2;
        if (health > maxHealth) {
            health = maxHealth;
        }
    }
});

// User releases mouse click
document.body.addEventListener("mouseup", function(e) {
    weaponActive = false;
    if (weapon == 1 && bowState == 0) { // Bow
        userProj.push({
            name: "arrow",
            projX: xPos,
            projY: yPos,
            direc: face,
            valid: true
        });
        bowState = 1;
    } else if (weapon == 4 && rangState) { // Boomerang
        userProj.push({
            name: "rang",
            projX: xPos,
            projY: yPos,
            direc: face,
            travelCount: 0,
            back: false,
            valid: true
        });
        rangState = false;
    }
});

// Display the gameplay
function displayGame() {
    // Display level
    displayArea(mapX, mapY);

    // Update character position
    updatePos();
    // Draw character
    circle(xPos, yPos, CHAR_DIAM);

    // Display all on-screen projectiles
    displayProjectiles();

    // Calculate projectile collisions
    calculateCollisions();

    // Heal effect
    if (healState > 0) {
        if (healState < 100) {
            image(healEffect, xPos - 50, yPos - 50);
        }
        healState++;
        // Cannot use heal again for about 30 seconds
        if (healState == 3000) {
            healState = 0;
        }
    }

    // Display weapon
    if (weaponActive) {
        if (weapon == 0) { // Sword
            if (face == 0) {
                image(swordUp, xPos - 38, yPos - 110);
            } else if (face == 1) {
                image(swordLeft, xPos - 110, yPos - 38);
            } else if (face == 2) {
                image(swordDown, xPos - 40, yPos - 8);
            } else {
                image(swordRight, xPos - 6, yPos - 36);
            }
        } else if (weapon == 1) { // Bow
            if (face == 0) {
                image(bowUp, xPos - 48, yPos - 92);
            } else if (face == 1) {
                image(bowLeft, xPos - 90, yPos - 50);
            } else if (face == 2) {
                image(bowDown, xPos - 52, yPos - 8);
            } else {
                image(bowRight, xPos - 10, yPos - 45);
            }
        } else if (weapon == 2) { // Wand
            if (face == 0) {
                image(wandUp, xPos - 48, yPos - 65);
            } else if (face == 1) {
                image(wandLeft, xPos - 57, yPos - 40);
            } else if (face == 2) {
                image(wandDown, xPos - 26, yPos - 4);
            } else {
                image(wandRight, xPos - 4, yPos - 40);
            }
        } else if (weapon == 4) { // Boomerang
            if (face == 0) {
                image(rangUp, xPos - 28, yPos - 45);
            } else if (face == 1) {
                image(rangLeft, xPos - 51, yPos - 36);
            } else if (face == 2) {
                image(rangDown, xPos - 25, yPos + 10);
            } else {
                image(rangRight, xPos - 4, yPos - 35);
            }
        }
    }
}

function displayProjectiles() {
    // Only allow fire every 50 ticks
    if (bowState > 0) {
        bowState++;
        if (bowState > 50) {
            bowState = 0;
        }
    }
    // Display currently active projectiles 
    for (let i = 0; i < userProj.length; i++) {
        if (userProj[i].name == "arrow") { // Arrow physics
            if (userProj[i].direc == 0) {
                image(arrowUp, userProj[i].projX - 36, userProj[i].projY);
                userProj[i].projY -= 7;
            } else if (userProj[i].direc == 1) {
                image(arrowLeft, userProj[i].projX, userProj[i].projY - 35);
                userProj[i].projX -= 7;
            } else if (userProj[i].direc == 2) {
                image(arrowDown, userProj[i].projX - 36, userProj[i].projY);
                userProj[i].projY += 7;
            } else {
                image(arrowRight, userProj[i].projX, userProj[i].projY - 35);
                userProj[i].projX += 7;
            }
        } else if (userProj[i].name == "flame") { // Flame physics
            if (userProj[i].direc == 0) {
                image(fireImg, userProj[i].projX - 36, userProj[i].projY - 84);
                if (userProj[i].travelCount <= 150) {
                    userProj[i].projY -= 2;
                }
            } else if (userProj[i].direc == 1) {
                image(fireImg, userProj[i].projX - 76, userProj[i].projY - 44);
                if (userProj[i].travelCount <= 150) {
                    userProj[i].projX -= 2;
                }
            } else if (userProj[i].direc == 2) {
                image(fireImg, userProj[i].projX - 36, userProj[i].projY);
                if (userProj[i].travelCount <= 150) { 
                    userProj[i].projY += 2;
                }
            } else {
                image(fireImg, userProj[i].projX, userProj[i].projY - 44);
                if (userProj[i].travelCount <= 150) {
                    userProj[i].projX += 2;
                }
            }
            userProj[i].travelCount += 2;
            // Stop traveling after 150 steps
            if (userProj[i].travelCount > 150) {
                // Resize fire image
                fireImg.resize(150, 150);
                userProj[i].lifeTime -= 1;
                // Active until lifetime runs out
                if (userProj[i].lifeTime <= 0) {
                    userProj[i].valid = false;
                    spellState = true;
                }
            }
        } else if (userProj[i].name == "rang") { // Flame physics
            if (userProj[i].direc == 0) {
                image(rangUp, userProj[i].projX - 36, userProj[i].projY - 84);
                if (!userProj[i].back) {
                    userProj[i].projY -= 8;
                } else {
                    userProj[i].projY += 8;
                }
            } else if (userProj[i].direc == 1) {
                image(rangLeft, userProj[i].projX - 76, userProj[i].projY - 44);
                if (!userProj[i].back) {
                    userProj[i].projX -= 8;
                } else {
                    userProj[i].projX += 8;
                }
            } else if (userProj[i].direc == 2) {
                image(rangDown, userProj[i].projX - 36, userProj[i].projY);
                if (!userProj[i].back) { 
                    userProj[i].projY += 8;
                } else {
                    userProj[i].projY -= 8;
                }
            } else {
                image(rangRight, userProj[i].projX, userProj[i].projY - 44);
                if (!userProj[i].back) {
                    userProj[i].projX += 8;
                } else {
                    userProj[i].projX -= 8;
                }
            }
            // Travel back after 100 steps
            if (userProj[i].travelCount > 100) {
                userProj[i].back = true;
            }
            // Reverse lifetime count
            if (!userProj[i].back) {
                userProj[i].travelCount += 2;
            } else {
                userProj[i].travelCount -= 2;
            }
            // Delete once cycled
            if (userProj[i].travelCount < 0) {
                userProj[i].valid = false;
                rangState = true;
            }
        }

        // See if projectile is off-screen except boomerang
        if ((userProj[i].projX < 0 || userProj[i].projX > WIDTH ||
            userProj[i].projY < 0 || userProj[i].projY > HEIGHT) && userProj[i].name != "rang") {
            userProj[i].valid = false;
            if (userProj[i].name == "flame") {
                spellState = true;
            }
        }
    }
    for (let j = 0; j < enemyProj.length; j++) {

    }

    // Clean up invalid projectiles
    for (let i = userProj.length - 1; i >= 0; i--) {
        if (!userProj[i].valid) { // Arrow physics
            userProj.splice(i, 1);
        }
    }
    for (let j = enemyProj.length - 1; j >= 0; j--) {
        if (!enemyProj[j].valid) { // Arrow physics
            enemyProj.splice(i, 1);
        }
    }
}

// Detect collisions between entities and projectiles
function calculateCollisions() {

}

// Clear projectile arrays
function resetProjectiles() {
    userProj = [];
    enemyProj = [];
    spellState = true;
    rangState = true;
    potionState = true;
    bowState = 0;
}


// Display map piece
function displayArea(mapX, mapY) {
    // Area (1, 1)
    if (mapX == 1 && mapY == 1) {
        rect(400, 500, 55, 55, 20);
        rect(600, 500, 55, 55, 20);
        rect(800, 500, 55, 55, 20);
    } else if (mapX == 1 && mapY == 0) { // Area (1, 0)
        rect(800, 100, 55, 55, 20);
        rect(800, 300, 55, 55, 20);
        rect(800, 500, 55, 55, 20);
    }
}

// Update to Arduino
function updateSerial() {
    // Send to serial
    if (mapX == 0 && mapY == 0) {
        serial.writeLine(0);
    } else if (mapX == 1 && mapY == 0) {
        serial.writeLine(1);
    } else if (mapX == 2 && mapY == 0) {
        serial.writeLine(2);
    } else if (mapX == 0 && mapY == 1) {
        serial.writeLine(3);
    } else if (mapX == 1 && mapY == 1) {
        serial.writeLine(4);
    } else if (mapX == 2 && mapY == 1) {
        serial.writeLine(5);
    } else if (mapX == 0 && mapY == 2) {
        serial.writeLine(6);
    } else if (mapX == 1 && mapY == 2) {
        serial.writeLine(7);
    } else if (mapX == 2 && mapY == 2) {
        serial.writeLine(8);
    }
}
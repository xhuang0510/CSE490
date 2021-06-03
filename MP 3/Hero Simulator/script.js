let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  };

// Canvas dimensions
const WIDTH = 1000;
const HEIGHT = 700;

function setup() {
  createCanvas(WIDTH, HEIGHT);

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

// Track player mouse position on screen
let mouseX = 0;
let mouseY = 0;

// Used for smooth movement
let right = false;
let left = false;
let up = false;
let down = false;

function draw() {
  background(0);
  stroke(250);
  fill(250); 
  textSize(64);

  // On menu screen
  if (gameState == 0) {
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

document.body.addEventListener("mousemove", function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
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
            } else if (xPos > CHAR_DIAM / 2) { // other movement
                xPos -= MOVE_STEP;
            } 
        } else if (right) {
            // If player crosses right area boundary
            if (xPos == WIDTH - (CHAR_DIAM / 2) && mapX < map[0].length - 1) {
                mapX++;
                xPos = CHAR_DIAM / 2;
                updateSerial();
            } else if (xPos < WIDTH - CHAR_DIAM / 2) {
                xPos += MOVE_STEP;
            }
        } else if (up) {
            // If a player crosses upper area boundary
            if (yPos == CHAR_DIAM / 2 && mapY > 0) {
                mapY--;
                yPos = HEIGHT - CHAR_DIAM;
                updateSerial();
            } else if (yPos > CHAR_DIAM / 2) {
                yPos -= MOVE_STEP;
            }
        } else if (down) {
            // If player crosses lower area boundary
            if (yPos == HEIGHT - (CHAR_DIAM / 2) && mapY < map.length - 1) {
                mapY++;
                yPos = CHAR_DIAM / 2;
                updateSerial();
            } else if (yPos < HEIGHT - CHAR_DIAM / 2) {
                yPos += MOVE_STEP;
            }
        }
    }
}

// User clicks mouse
document.body.addEventListener("mousedown", function(e) {
    weaponActive = true;
});

// User releases mouse click
document.body.addEventListener("mouseup", function(e) {
    weaponActive = false;
});

// Display the gameplay
function displayGame() {
    // Display level
    displayArea(mapX, mapY);

    // Update character position
    updatePos();
    // Draw character
    circle(xPos, yPos, CHAR_DIAM);

    // Display weapon
    if (weaponActive) {
        if (weapon == 0) { // Sword
            if (face == 0) {
                rect(xPos - 5, yPos - 80, 10, 80);
            } else if (face == 1) {
                rect(xPos - 80, yPos - 5, 80, 10);
            } else if (face == 2) {
                rect(xPos - 5, yPos - 5, 10, 80);
            } else {
                rect(xPos, yPos - 5, 80, 10);
            }
        } else if (weapon == 1) { // Bow
            if (face == 0) {
                rect(xPos - 5, yPos - 200, 10, 200);
            } else if (face == 1) {
                rect(xPos - 200, yPos - 5, 200, 10);
            } else if (face == 2) {
                rect(xPos - 5, yPos - 5, 10, 200);
            } else {
                rect(xPos, yPos - 5, 200, 10);
            }
        }
    }
}

// Display map piece
function displayArea(mapX, mapY) {
    // Area (1, 1)
    if (mapX == 1 && mapY == 1) {
        rect(400, 500, 55, 55, 20);
        rect(600, 500, 55, 55, 20);
        rect(800, 500, 55, 55, 20);
    } else if (mapX == 1 && mapY == 0) {
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
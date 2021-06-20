let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  };

// ----------------- ML ------------------ //
let video;
let poseNet;
let currentPoses;
let poseNetModelReady = false;

/**
 * Callback function called by ml5.js PoseNet when the PoseNet model is ready
 * Will be called once and only once
 */
function onPoseNetModelReady() {
    poseNetModelReady = true;
}

/**
 * Callback function called by ml5.js PosetNet when a pose has been detected
 */
function onPoseDetected(poses) {
    currentPoses = poses;
    if(currentPoses){
        let strHuman = " human";
        if(currentPoses.length > 1){
        strHuman += 's';
        }
        text("We found " + currentPoses.length + strHuman);
    }
}

// Game constants
const WIDTH = 1000;
const HEIGHT = 700;
const ENTITY_SIZE = 60;
const NUM_ENEMIES = 60;
const GRAND_SPELL_COOLDOWN = 4500;

// Sword images
let swordRight, swordLeft, swordUp, swordDown;

// Bow images
let bowRight, bowLeft, bowUp, bowDown;

// Wand images
let wandRight, wandLeft, wandUp, wandDown;

// Heal effect
let healEffect;

// Boomerang images
let rangRight, rangLeft, rangUp, rangDown;

// Arrow images
let arrowRight, arrowLeft, arrowUp, arrowDown;

// Fire spell image
let fireImg;

// Background image
let grassImg

// Character images
let charRight, charLeft, charUp, charDown;

// Enemy sprites
let wanderImg, chaseImg, knightImg, knightChaserImg, guardianImg, casterImg,
    skeletonImg, bossImg;

// Load home screen art
let pedestalImg;

// Preload images
function preload() {
  // Load sword images
  swordRight = loadImage('assets/items/sword_right.png');
  swordLeft = loadImage('assets/items/sword_left.png');
  swordUp = loadImage('assets/items/sword_up.png');
  swordDown = loadImage('assets/items/sword_down.png');
  // Load bow images
  bowRight = loadImage('assets/items/bow_right.png');
  bowLeft = loadImage('assets/items/bow_left.png');
  bowUp = loadImage('assets/items/bow_up.png');
  bowDown = loadImage('assets/items/bow_down.png');
  // Load wand images
  wandRight = loadImage('assets/items/wand_right.png');
  wandLeft = loadImage('assets/items/wand_left.png');
  wandUp = loadImage('assets/items/wand_up.png');
  wandDown = loadImage('assets/items/wand_down.png');
  // Load heal animation
  healEffect = loadImage('assets/animations/heal.gif');
  // Load boomerang images
  rangRight = loadImage('assets/items/rang_right.png');
  rangLeft = loadImage('assets/items/rang_left.png');
  rangUp = loadImage('assets/items/rang_up.png');
  rangDown = loadImage('assets/items/rang_down.png');
  // Load arrow images
  arrowRight = loadImage('assets/projectiles/arrow_right.png');
  arrowLeft = loadImage('assets/projectiles/arrow_left.png');
  arrowUp = loadImage('assets/projectiles/arrow_up.png');
  arrowDown = loadImage('assets/projectiles/arrow_down.png');
  // Load fire spell
  fireImg = loadImage('assets/projectiles/fire.png');
  // Load grass
  grassImg = loadImage('assets/map/grass.png');
  // Load char images
  charRight = loadImage('assets/entities/char_right.png');
  charLeft = loadImage('assets//entities/char_left.png');
  charUp = loadImage('assets/entities/char_up.png');
  charDown = loadImage('assets/entities/char_down.png');
  // Load enemy images
  wanderImg = loadImage('assets/entities/wanderer_sprite.png');
  chaseImg = loadImage('assets/entities/chaser_sprite.png'); 
  knightImg = loadImage('assets/entities/knight_sprite.png');
  knightChaserImg = loadImage('assets/entities/chaser_knight_sprite.png');
  guardianImg = loadImage('assets/entities/guardian_sprite.png');
  skeletonImg = loadImage('assets/entities/skeleton_sprite.png');
  bossImg = loadImage('assets/entities/boss_sprite.png');
  // Load game obstacles
  pedestalImg = loadImage('assets/map/pedestal.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);

  // Resize sword images
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

  // Resize character images
  charRight.resize(ENTITY_SIZE, ENTITY_SIZE);
  charLeft.resize(ENTITY_SIZE, ENTITY_SIZE);
  charUp.resize(ENTITY_SIZE, ENTITY_SIZE);
  charDown.resize(ENTITY_SIZE, ENTITY_SIZE);

  // Resize enemies
  wanderImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  chaseImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  knightImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  knightChaserImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  guardianImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  skeletonImg.resize(ENTITY_SIZE, ENTITY_SIZE);
  bossImg.resize(ENTITY_SIZE, ENTITY_SIZE);

  pedestalImg.resize(150, 300);

  // Set up game
  setUpGame();

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // ml5js PoseNet initialization
  video = createCapture(VIDEO);
  video.hide(); // hide raw video (feel free to comment in/out to see effect)
  poseNet = ml5.poseNet(video, onPoseNetModelReady); //call onPoseNetModelReady when ready
  poseNet.on('pose', onPoseDetected); // call onPoseDetected when pose detected
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

// Game constants
const MOVE_STEP = 5;
const CHAR_DIAM = 50;

// Track the game state
let gameState = 0;

// Track whether game is paused
let paused = false;

// Track whether user is casting
let ml5Casting = false;

// Track player health
let maxHealth = 4;
let health = 4;

// Track player position
let xPos = WIDTH / 2;
let yPos = HEIGHT / 2;

// Track which direction player is facing
// 0 = up, 1 = left, 2 = down, 3 = right
let face = 2;

// Track player weapon
let weapon = 0;
let weaponActive = false;

// Track when the game is over and when the boss is available
let killCount = 0;

// Track player map position and load enemies
let map = [
    [], [], [],
    [], [], [],
    [], [], []
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

// Track active states of items
let spellState = true;
let rangState = true;
let potionState = true;
let bowState = 0;
let healState = 0;

// Track invincibility frames
let invulPlayer = 0;
let playerHitDirec = 1;

// Enemies change direction
let directionTime = 0;

// Track pose direction and if casted properly
let ml5CastSide = "red";
let ml5FillColor = "red";
let confirmTime = 0;
let casted = false;

// Track grand spell cooldown
let grandSpellCooldown = 0;
let freezeTime = 0;
let frozen = false;

// Sets up the game with area designs and enemy placements
function setUpGame() {
    // Fill each area array with enemies
    // Fill area (0, 0)
    map[0].push({ name: "guardian", currX: 200, currY: 100, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 450, currY: 100, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 700, currY: 100, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 200, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 450, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 700, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 200, currY: 500, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 450, currY: 500, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "guardian", currX: 700, currY: 500, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knightChaser", currX: 200, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knight", currX: 450, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knightChaser", currX: 700, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knightChaser", currX: 200, currY: 600, health: 20, speed: 2, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knight", currX: 450, currY: 600, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[0].push({ name: "knightChaser", currX: 700, currY: 600, health: 20, speed: 2, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    // Fill area (1, 0)
    map[1].push({ name: "skeleton", currX: 200, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[1].push({ name: "skeleton", currX: 600, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[1].push({ name: "skeleton", currX: 300, currY: 200, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[1].push({ name: "skeleton", currX: 600, currY: 200, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    // Fill area (2, 0)
    map[2].push({ name: "skeleton", currX: 200, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[2].push({ name: "skeleton", currX: 600, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[2].push({ name: "skeleton", currX: 300, currY: 200, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[2].push({ name: "knightChaser", currX: 700, currY: 100, health: 20, speed: 4, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[2].push({ name: "knightChaser", currX: 200, currY: 600, health: 20, speed: 4, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[2].push({ name: "wander", currX: 500, currY: 500, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[2].push({ name: "wander", currX: 400, currY: 400, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[2].push({ name: "wander", currX: 300, currY: 300, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[2].push({ name: "wander", currX: 300, currY: 600, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    // Fill area (0, 1)
    map[3].push({ name: "knight", currX: 200, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[3].push({ name: "knight", currX: 450, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[3].push({ name: "knight", currX: 700, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[3].push({ name: "knight", currX: 200, currY: 600, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[3].push({ name: "chaser", currX: 600, currY: 600, health: 5, speed: 6, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[3].push({ name: "chaser", currX: 400, currY: 700, health: 5, speed: 6, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[3].push({ name: "chaser", currX: 600, currY: 600, health: 5, speed: 6, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    // Fill area (1, 1)
    map[4].push({ name: "wander", currX: 500, currY: 500, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[4].push({ name: "wander", currX: 400, currY: 400, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[4].push({ name: "wander", currX: 300, currY: 300, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[4].push({ name: "wander", currX: 300, currY: 600, health: 5, speed: 2, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[4].push({ name: "chaser", currX: 600, currY: 600, health: 5, speed: 2, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[4].push({ name: "chaser", currX: 400, currY: 700, health: 5, speed: 2, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    // Fill area (2, 1)
    map[5].push({ name: "guardian", currX: 200, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[5].push({ name: "guardian", currX: 450, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[5].push({ name: "guardian", currX: 700, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[5].push({ name: "wander", currX: 500, currY: 500, health: 5, speed: 6, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[5].push({ name: "wander", currX: 400, currY: 400, health: 5, speed: 6, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[5].push({ name: "wander", currX: 300, currY: 300, health: 5, speed: 6, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[5].push({ name: "wander", currX: 300, currY: 600, health: 5, speed: 6, atk: 1,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[5].push({ name: "chaser", currX: 600, currY: 600, health: 5, speed: 6, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    map[5].push({ name: "chaser", currX: 400, currY: 700, health: 5, speed: 6, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0}); 
    // Fill area (0, 2)
    map[6].push({ name: "skeleton", currX: 200, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[6].push({ name: "skeleton", currX: 600, currY: 600, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[6].push({ name: "skeleton", currX: 300, currY: 200, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[6].push({ name: "skeleton", currX: 600, currY: 200, health: 0, speed: 3, atk: 2,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[6].push({ name: "knightChaser", currX: 200, currY: 600, health: 60, speed: 5, atk: 6,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    // Fill area (1, 2)
    map[7].push({ name: "guardian", currX: 200, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[7].push({ name: "guardian", currX: 450, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[7].push({ name: "guardian", currX: 700, currY: 300, health: 20, speed: 0, atk: 6,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[7].push({ name: "knightChaser", currX: 200, currY: 600, health: 20, speed: 3, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[7].push({ name: "knight", currX: 450, currY: 600, health: 60, speed: 1, atk: 7,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[7].push({ name: "knightChaser", currX: 700, currY: 600, health: 20, speed: 3, atk: 3,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    // Fill area (2, 2)
    map[8].push({ name: "knight", currX: 200, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 450, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 700, currY: 100, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 200, currY: 300, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knightChaser", currX: 450, currY: 300, health: 100, speed: 5, atk: 1,
        aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 700, currY: 300, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 200, currY: 500, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 450, currY: 500, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    map[8].push({ name: "knight", currX: 700, currY: 500, health: 20, speed: 2, atk: 3,
        aiType: "move", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
}

function draw() {
  background(grassImg);
  stroke(0);
  textSize(64);
  fill(250);

  // On menu screen
  if (gameState == 0) {
    fill(250); 
    text("Hero Simulator", (width / 4) + 16, height / 4);

    // Insert some artwork here
    image(pedestalImg, (width / 3) + 75, (height / 4) + 16);

    // If user has not connected serial
    textSize(32);
    if (!serial.isOpen()) {
        text("Click to Connect to Serial!", (width / 4) + 45, height - 150);
    } else { // Player connected serial, display play button
        text("Play", (width / 2) - 45, height - 150);
    }
  } else if (gameState == 1) { // In game
    if (!serial.isOpen()) {
        fill(250); 
        textSize(32);
        stopPlayer();
        weaponActive = false;
        paused = true;
        text("Click to Connect to Serial!", (width / 4) + 45, height - 150);
    }
    textSize(64);
    if (paused) {
        // Casting spell menu
        if (ml5Casting) {
            if(!poseNetModelReady) {
                textSize(32);
                textAlign(CENTER);
                fill(255);
                noStroke();
                text("Waiting for PoseNet model to load...", width / 2, height / 2);
            }
            text("CAST GRAND SPELL", 180, 90);
            image(video, 175, 112); // draw the video to the screen at 0,0
            text("L = DMG", 120, 670);
            text("R = FRZ", 640, 670);
            if(currentPoses) {
                for(let human of currentPoses){
                    fill(ml5FillColor);
                    noStroke();
                    circle(human.pose.rightWrist.x + 205, human.pose.rightWrist.y + 20, 20);
                    // If properly cast
                    if (human.pose.rightWrist.x + 205 <= 400) {
                        ml5CastSide = "red";
                        ml5FillColor = "red";
                    } else if (human.pose.rightWrist.x + 205 >= 600) {
                        ml5CastSide = "blue";
                        ml5FillColor = "blue";
                    } else {
                        ml5CastSide = "white";
                        ml5FillColor = "white";
                    }
                    if ((ml5CastSide == "red" || ml5CastSide == "blue")
                        && human.pose.rightWrist.y + 20 >= 400) {
                        confirmTime++;
                        ml5FillColor = "green";
                        // Have user confirm selection
                        if (confirmTime >= 200) {
                            confirmTime = 0;
                            ml5Casting = false;
                            grandSpellCooldown = 1;
                            casted = true;
                        }
                    }
                }
            }
        } else {
            text("PAUSED", (width / 3) + 20, height / 4);
            if (grandSpellCooldown > 0) {
                text("On Cooldown: " + (GRAND_SPELL_COOLDOWN - grandSpellCooldown) / 100, 220, 380);
            } else {
                text("Click to Cast Grand Spell", 130, 380);
            }
            if (casted) {
                text("Casted: " + (ml5CastSide == "red" ? "Mass Damage" : "Time Freeze"), 200, 600);
            } else {
                text("Casted: Nothing", 250, 600);
            }
        }
    } else {
        fill(200); 
        // Display the gameplay
        displayGame();
    }
    // Win the game
    if (killCount == NUM_ENEMIES + 1) {
        gameState++;
    }
  } else { // Game over
    if (killCount == NUM_ENEMIES + 1) {
        text("You Win!!", (width / 4) + 90, height - 150);
    } else {
        text("Game Over", (width / 4) + 90, height - 150);
    }
  }
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
        if (gameState == 0 && serial.isOpen()) {
            gameState++;
        } else if (gameState == 1) { // In game
            if (!ml5Casting) {
                paused = !paused;
                stopPlayer();
                weaponActive = false;
            }
        } else { // On game over screen
            restart();
            setUpGame();
            gameState = 0;
            updateSerial();
        }
    } 
    if (!paused) {
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
    }
});

// Take in key press events
document.addEventListener('keyup', function(e) {
    if (!paused) {
        if (e.code == "KeyW") { // W key
            up = false;
        } else if (e.code == "KeyA") { // A key
            left = false;
        } else if (e.code == "KeyS") { // S key
            down = false;
        } else if (e.code == "KeyD") { // D key
            right = false;
        }
    }
});

// User clicks mouse
document.body.addEventListener("mousedown", function(e) {
    if (!paused) {
        weaponActive = true;
        if (weapon == 0) { // Sword
            registerSwordSwing();
        } else if (weapon == 2 && spellState) { // Wand
            userProj.push({
                name: "flame",
                projX: xPos,
                projY: yPos,
                direc: face,
                lifeTime: 300,
                travelCount: 0,
                valid: true,
                size: 75
            });
            spellState = false;
            fireImg.resize(75, 75);
        } else if (weapon == 3 && healState == 0) { // Heal
            healState = 1;
            health += 2;
            if (health > maxHealth) {
                health = maxHealth;
            }
            updateSerial();
        }
    } else if (paused && grandSpellCooldown == 0) { // Casting
        ml5Casting = !ml5Casting;
        confirmTime = 0;
    }
});

// User releases mouse click
document.body.addEventListener("mouseup", function(e) {
    if (!paused) {
        weaponActive = false;
        if (weapon == 1 && bowState == 0) { // Bow
            userProj.push({
                name: "arrow",
                projX: xPos,
                projY: yPos,
                direc: face,
                valid: true,
                size: 75,
                hit: false
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
                valid: true,
                size: 50,
                hit: false
            });
            rangState = false;
        }
    }
});

// Display the gameplay
function displayGame() {
    // Check if still alive
    if (health <= 0) {
        gameState++;
    }

    // Display enemies
    displayEnemies();

    // Display active weapon
    displayWeapon();

    // Update character position
    updatePos();
    // Draw character
    if (invulPlayer > 0) { // Invincibility frame flicker
        if (invulPlayer < 5 || invulPlayer > 15) {
            displayChar();
        } 
    } else {
        displayChar();
    }
    
    if (!paused) {
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

        // If player casted grand spell
        if (casted) {
            casted = false;
            handleGrandSpell();
        }

        // Cooldown for casting grand spells
        if (grandSpellCooldown > 0) {
            grandSpellCooldown++;
            if (grandSpellCooldown == GRAND_SPELL_COOLDOWN) {
                grandSpellCooldown = 0;
            } 
            // Freeze timer
            if (grandSpellCooldown > 700) {
                frozen = false;
            }
        }
    }
}

// Handle grand spell casts
function handleGrandSpell() {
    if (ml5CastSide == "red") { // Mass damage
        for (let i = 0; i < map[mapIndex].length; i++) {
            map[mapIndex][i].health -= 10;
            map[mapIndex][i].hitDirec = 3;
            map[mapIndex][i].invul = 1;
        }
    } else { // Time freeze
        frozen = true;
    }
}

// Detect collisions between entities and projectiles
function calculateCollisions() {
    mapIndex = convertXYToMapArrayIndex(mapX, mapY);
    // See if enemy collided with player
    if (invulPlayer == 0) { // Only calculate if player is not invincible
        for (let i = 0; i < map[mapIndex].length; i++) {
            if (checkUpperBoundingBox(i, mapIndex, xPos, yPos, ENTITY_SIZE)) {
                health -= map[mapIndex][i].atk / 2.0;
                updateSerial();
                invulPlayer = 1;
                playerHitDirec = 1;
            } else if (checkLeftBoundingBox(i, mapIndex, xPos, yPos, ENTITY_SIZE)) {
                health -= map[mapIndex][i].atk / 2.0;
                updateSerial();
                invulPlayer = 1;
                playerHitDirec = 2;
            } else if (checkLowerBoundingBox(i, mapIndex, xPos, yPos, ENTITY_SIZE)) {
                health -= map[mapIndex][i].atk / 2.0;
                updateSerial();
                invulPlayer = 1;
                playerHitDirec = 3;
            } else if (checkRightBoundingBox(i, mapIndex, xPos, yPos, ENTITY_SIZE)) {
                health -= map[mapIndex][i].atk / 2.0;
                updateSerial();
                invulPlayer = 1;
                playerHitDirec = 4;
            }
        }
    }
    // Check enemy collisions with player projectiles
    for (let i = 0; i < map[mapIndex].length; i++) {
        for (let j = 0; j < userProj.length; j++) {
            if (checkUpperBoundingBox(i, mapIndex, userProj[j].projX, userProj[j].projY, userProj[j].size)) {
                calculateDamage(userProj[j].name, mapIndex, i);
                map[mapIndex][i].hitDirec = 0;
                map[mapIndex][i].invul = 1;
                userProj[j].hit = true;
            } else if (checkLeftBoundingBox(i, mapIndex, userProj[j].projX, userProj[j].projY, userProj[j].size)) {
                calculateDamage(userProj[j].name, mapIndex, i);
                map[mapIndex][i].hitDirec = 1;
                map[mapIndex][i].invul = 1;
                userProj[j].hit = true;
            } else if (checkLowerBoundingBox(i, mapIndex, userProj[j].projX, userProj[j].projY, userProj[j].size)) {
                calculateDamage(userProj[j].name, mapIndex, i);
                map[mapIndex][i].hitDirec = 2;
                map[mapIndex][i].invul = 1;
                userProj[j].hit = true;
            } else if (checkRightBoundingBox(i, mapIndex, userProj[j].projX, userProj[j].projY, userProj[j].size)) {
                calculateDamage(userProj[j].name, mapIndex, i);
                map[mapIndex][i].hitDirec = 3;
                map[mapIndex][i].invul = 1;
                userProj[j].hit = true;
            }
        }
    }
}

// Check if player crossed the bounding boxes, returns true if yes, no otherwise
function checkUpperBoundingBox(i, mapIndex, xVal, yVal, size) {
    return map[mapIndex][i].currY - 5 < yVal && 
        map[mapIndex][i].currY + 5 > yVal && 
        map[mapIndex][i].currX - 5 < xVal && 
        map[mapIndex][i].currX + size + 5 > xVal;
}

function checkLeftBoundingBox(i, mapIndex, xVal, yVal, size) {
    return map[mapIndex][i].currX - 5 < xVal && 
        map[mapIndex][i].currX + 5 > xVal && 
        map[mapIndex][i].currY - 5 < yVal && 
        map[mapIndex][i].currY + size + 5 > yVal;
}

function checkLowerBoundingBox(i, mapIndex, xVal, yVal, size) {
    return map[mapIndex][i].currY + size - 5 < yVal && 
        map[mapIndex][i].currY + size + 5 > yVal && 
        map[mapIndex][i].currX - 5 < xVal && 
        map[mapIndex][i].currX + size + 5 > xVal;
}

function checkRightBoundingBox(i, mapIndex, xVal, yVal, size) {
    return map[mapIndex][i].currX + size - 5 < xVal && 
        map[mapIndex][i].currX + size + 5 > xVal && 
        map[mapIndex][i].currY - 5 < yVal && 
        map[mapIndex][i].currY + size + 5 > yVal;
}

// Separate function for calculating sword collision
function registerSwordSwing() {
    mapIndex = convertXYToMapArrayIndex(mapX, mapY);
    for (let i = 0; i < map[mapIndex].length; i++) {
        let x = Math.abs(xPos - map[mapIndex][i].currX - (ENTITY_SIZE / 2));
        let y = Math.abs(yPos - map[mapIndex][i].currY - (ENTITY_SIZE / 2));
        if (Math.sqrt(x * x + y * y) < 120) { // Detect sword swing within 120 units
            if (face == 0) {
                map[mapIndex][i].health -= 4;
                map[mapIndex][i].hitDirec = 0;
                map[mapIndex][i].invul = 1;
            } else if (face == 1) {
                map[mapIndex][i].health -= 4;
                map[mapIndex][i].hitDirec = 1;
                map[mapIndex][i].invul = 1;
            } else if (face == 2) {
                map[mapIndex][i].health -= 4;
                map[mapIndex][i].hitDirec = 2;
                map[mapIndex][i].invul = 1;
            } else if (face == 3) { 
                map[mapIndex][i].health -= 4;
                map[mapIndex][i].hitDirec = 3;
                map[mapIndex][i].invul = 1;
            }
        }
    }
}

// Calculates how much damage is delt to enemy
function calculateDamage(name, mapIndex, i) {
    if (name == "flame") {
        map[mapIndex][i].health -= 1;
    } else if (name == "rang") {
        map[mapIndex][i].health -= 2;
    } else if (name == "arrow") {
        map[mapIndex][i].health -= 4;
    }
}

// Update player position
function updatePos() {
    if (gameState == 1 && !paused && invulPlayer == 0) {
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
            if (xPos == WIDTH - (CHAR_DIAM / 2) && mapX < 2) {
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
            if (yPos == HEIGHT - (CHAR_DIAM / 2) && mapY < 2) {
                mapY++;
                yPos = CHAR_DIAM / 2;
                updateSerial();
                resetProjectiles();
            } else if (yPos < HEIGHT - CHAR_DIAM / 2) {
                yPos += MOVE_STEP;
            }
        }
    } else if (invulPlayer > 0) {
        invulPlayer += 2;
        // Bounce back depending on which boundary is hit
        if (playerHitDirec == 1 && yPos > (CHAR_DIAM / 2) + 20) {
            yPos -= 5;
        } else if (playerHitDirec == 2 && xPos > (CHAR_DIAM / 2) + 20) {
            xPos -= 5;
        } else if (playerHitDirec == 3 && yPos < HEIGHT - (CHAR_DIAM / 2) - 20) {
            yPos += 5;
        } else if (playerHitDirec == 4 && xPos < WIDTH - (CHAR_DIAM / 2) - 20) {
            xPos += 5;
        }
        // Invulnerable for 40 ticks
        if (invulPlayer >= 40) {
            invulPlayer = 0;
        }
    }
}

// Stops player movement
function stopPlayer() {
    left = false;
    right = false;
    down = false;
    up = false;
}

// Draw character
function displayChar() {
    if (face == 0) { // Up
        image(charUp, xPos - 32, yPos - 35);
    } else if (face == 1) { // Left
        image(charLeft, xPos - 32, yPos - 35);
    } else if (face == 2) { // Down
        image(charDown, xPos - 32, yPos - 35);
    } else { // Right
        image(charRight, xPos - 32, yPos - 35);
    }
}

// Drawe active weapon
function displayWeapon() {
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

// Display all projectiles on screen
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
                userProj[i].size *= 2;
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

    // Clean up invalid projectiles
    for (let i = userProj.length - 1; i >= 0; i--) {
        if (!userProj[i].valid || (userProj[i].hit && userProj[i].name == "arrow")) { // Arrows hit once
            userProj.splice(i, 1);
        } 
    }
}

// Clear projectile arrays
function resetProjectiles() {
    userProj = [];
    spellState = true;
    rangState = true;
    potionState = true;
    bowState = 0;
}

// Display all enemies
function displayEnemies() {
    mapIndex = convertXYToMapArrayIndex(mapX, mapY);
    for(let i = 0; i < map[mapIndex].length; i++) {
        if (map[mapIndex][i].name == "wander") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(wanderImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(wanderImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "chaser") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(chaseImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(chaseImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "knight") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(knightImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(knightImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "knightChaser") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(knightChaserImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(knightChaserImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "skeleton") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(skeletonImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(skeletonImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "caster") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(casterImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(casterImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "guardian") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(guardianImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(guardianImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } else if (map[mapIndex][i].name == "boss") {
            if (map[mapIndex][i].invul > 0) { // Invincibility frame flicker
                if (map[mapIndex][i].invul < 5 || map[mapIndex][i].invul > 15) {
                    image(bossImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
                } 
            } else {
                image(bossImg, map[mapIndex][i].currX, map[mapIndex][i].currY);
            }
        } 
    }
    // Cannot move if grand freeze is cast
    if (!frozen) {
        enemyMove();
    }
    // Remove dead enemies except skeletons
    for(let j = map[mapIndex].length - 1; j >= 0; j--) {
        if (map[mapIndex][j].health <= 0 && map[mapIndex][j].name != "skeleton") {
            map[mapIndex].splice(j, 1);
            killCount++;
        } 
    }

    // If all enemies are killed, except skeletons, display boss
    if (killCount == NUM_ENEMIES - 1) {
        killCount++;
        map[1].push({ name: "boss", currX: 400, currY: 400, health: 120, speed: 4, atk: 4,
                      aiType: "chase", invul: 0, direction: 0, direcTime: 0, bounced: false, hitDirec: 0});
    }
}

// Enemy AI that does not actively chase the player
function enemyMove() {
    mapIndex = convertXYToMapArrayIndex(mapX, mapY);
    for (let i = 0; i < map[mapIndex].length; i++) {
        // Update the counter
        map[mapIndex][i].direcTime++;
        if (map[mapIndex][i].invul == 0) {
            // This type of enemy will move randomly
            if (map[mapIndex][i].aiType == "move") {
                randomMove(i, mapIndex);
            } else if (map[mapIndex][i].aiType == "chase") { // This type of enemy will chase the player
                let x = Math.abs(xPos - map[mapIndex][i].currX);
                let y = Math.abs(yPos - map[mapIndex][i].currY);
                if (Math.sqrt(x * x + y * y) > 200) { // If more than 500 units away
                    randomMove(i, mapIndex);
                } else { // If within range, chase
                    if (map[mapIndex][i].currX < xPos - 25) {
                        map[mapIndex][i].currX += map[mapIndex][i].speed;
                    } else {
                        map[mapIndex][i].currX -= map[mapIndex][i].speed;
                    }
                    if (map[mapIndex][i].currY < yPos - 25) {
                        map[mapIndex][i].currY += map[mapIndex][i].speed;
                    } else {
                        map[mapIndex][i].currY -= map[mapIndex][i].speed;
                    }
                }
            } 
        } else if (map[mapIndex][i].invul > 0) { // Bounce back when hit
            map[mapIndex][i].invul += 2;
            // Bounce back depending on which boundary is hit
            if (map[mapIndex][i].name != "guardian") { // Guardians never move
                if (map[mapIndex][i].hitDirec == 1 && map[mapIndex][i].currY > (CHAR_DIAM / 2) + 20) {
                    map[mapIndex][i].currY -= 5;
                } else if (map[mapIndex][i].hitDirec == 2 && map[mapIndex][i].currX > (CHAR_DIAM / 2) + 20) {
                    map[mapIndex][i].currX -= 5;
                } else if (map[mapIndex][i].hitDirec == 3 && map[mapIndex][i].currY < HEIGHT - (CHAR_DIAM / 2) - 20) {
                    map[mapIndex][i].currY += 5;
                } else if (map[mapIndex][i].hitDirec == 4 && map[mapIndex][i].currX < WIDTH - (CHAR_DIAM / 2) - 20) {
                    map[mapIndex][i].currX += 5;
                }
            }
            // Invulnerable for 40 ticks
            if (map[mapIndex][i].invul >= 40) {
                map[mapIndex][i].invul = 0;
            }
        }
    }
}

// Helper function for random move
function randomMove(i, mapIndex) {
    if (map[mapIndex][i].direcTime > 50) {
        map[mapIndex][i].direction = Math.floor(Math.random() * 4);
        map[mapIndex][i].direcTime = 0;
        map[mapIndex][i].bounced = false;
    }
    if (map[mapIndex][i].direction == 0) {
        if (map[mapIndex][i].currY < ENTITY_SIZE || map[mapIndex][i].bounced) {
            map[mapIndex][i].currY += map[mapIndex][i].speed;
            map[mapIndex][i].bounced = true;
        } else {
            map[mapIndex][i].currY -= map[mapIndex][i].speed;
        }
    } else if (map[mapIndex][i].direction == 1 || map[mapIndex][i].bounced) {
        if (map[mapIndex][i].currX < ENTITY_SIZE) {
            map[mapIndex][i].currX += map[mapIndex][i].speed;
            map[mapIndex][i].bounced = true;
        } else {
            map[mapIndex][i].currX -= map[mapIndex][i].speed;
        }
    } else if (map[mapIndex][i].direction == 2 || map[mapIndex][i].bounced) {
        if (map[mapIndex][i].currY > HEIGHT - ENTITY_SIZE) {
            map[mapIndex][i].currY -= map[mapIndex][i].speed;
            map[mapIndex][i].bounced = true;
        } else {
            map[mapIndex][i].currY += map[mapIndex][i].speed;
        }
    } else if (map[mapIndex][i].direction == 3 || map[mapIndex][i].bounced) {
        if (map[mapIndex][i].currX > WIDTH - ENTITY_SIZE) {
            map[mapIndex][i].currX -= map[mapIndex][i].speed;
            map[mapIndex][i].bounced = true;
        } else {
            map[mapIndex][i].currX += map[mapIndex][i].speed;
        }
    }
}

// Restart game
function restart() {
    paused = false;
    maxHealth = 4;
    health = 4;
    xPos = WIDTH / 2;
    yPos = HEIGHT / 2;
    face = 2;
    weapon = 0;
    weaponActive = false;
    killCount = 0;
    map = [
        [], [], [],
        [], [], [],
        [], [], []
    ];
    mapX = 1;
    mapY = 1;
    right = false;
    left = false;
    up = false;
    down = false;
    userProj = [];
    spellState = true;
    rangState = true;
    potionState = true;
    bowState = 0;
    healState = 0;
    invulPlayer = 0;
    playerHitDirec = 1;
    directionTime = 0;
    ml5CastSide = "red";
    ml5FillColor = "red";
    confirmTime = 0;
    casted = false;
    grandSpellCooldown = 0;
    reezeTime = 0;
    frozen = false;
}

// Update to Arduino
function updateSerial() {
    // Send to serial
    serial.writeLine((health * 20) + convertXYToMapArrayIndex(mapX, mapY) 
    + (100 * (gameState == 0 ? 1 : 0)));
}

// Helper function for less code
function convertXYToMapArrayIndex(mapX, mapY) {
    if (mapX == 0 && mapY == 0) {
        return 0;
    } else if (mapX == 1 && mapY == 0) {
        return 1;
    } else if (mapX == 2 && mapY == 0) {
        return 2;
    } else if (mapX == 0 && mapY == 1) {
        return 3;
    } else if (mapX == 1 && mapY == 1) {
        return 4;
    } else if (mapX == 2 && mapY == 1) {
        return 5;
    } else if (mapX == 0 && mapY == 2) {
        return 6;
    } else if (mapX == 1 && mapY == 2) {
        return 7;
    } else if (mapX == 2 && mapY == 2) {
        return 8;
    }
}
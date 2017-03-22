// Display
const heightBlocks = 14;
const widthBlocks = 27;
const blockSize = 30;
const height = heightBlocks * blockSize;
const width = widthBlocks * blockSize;
const gravObjColor = 0x351777;
const circleRadius = 259;

// Physics
const gravCoef = 150000;
const frictionCoef = 0.5;
const groundAcceleration = 30;
const airAcceleration = 5;
const maxHorizontalVelocity = 250;
const jumpVelocity = 300;

// Levels
let levels;
let levelCount;
let currentLevelNum;

// Displayed objects
let player;
let exit;
let exits;
let walls;
let gravObjects;
let shockers;
let playerShadowLeft;
let playerShadowRight;
let playerShadowBottom;
let playerShadowTop;

// Pausing
let pauseBtn;
let pauseText;

// Menu
let background;
let startBtn;

// Other
const jumpFrames = 10;
const startingLevelNum = 0;
let previous_velocity_y;

let player_startX;
let player_startY;
let graphics;
let clickedObj;
let jumpCount;
let isJumping = false;
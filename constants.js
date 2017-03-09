// Display
const heightBlocks = 14;
const widthBlocks = 27;
const height = heightBlocks * 30;
const width = widthBlocks * 30;
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
var levels;
var levelCount;
var currentLevelNum;

// Displayed objects
var player;
var exit;
var exits;
var walls;
var gravObjects;
var shockers;

// Pausing
var pauseBtn;
var pauseText;

// Other
const jumpFrames = 10;
const startingLevelNum = 0;

var player_startX;
var player_startY;
var graphics;
var clickedObj;
var jumpCount;

var loading=true;
// Display
const heightBlocks = 14;
const widthBlocks = 27;
const height = heightBlocks * 30;
const width = widthBlocks * 30;
const gravObjColor = 0x351777;

// Physics
const gravCoef = 150000;
const frictionCoef = 0.5;
const groundAcceleration = 30;
const airAcceleration = 5;
const maxHorizontalVelocity = 250;
const jumpVelocity = 300;

// Other
const jumpFrames = 10;
const startingLevelNum = 6;

let player;
let exit;
let exits;
let walls;
let gravObjects;
let shockers;

let player_startX;
let player_startY;
let levels;
let currentLevelNum;
let graphics;
let clickedObj;
let jumpCount;
let pauseBtn;
let pauseText;
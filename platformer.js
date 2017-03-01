let game = new Phaser.Game(800, 400);
game.state.add('main', {preload: preload, create: create, update: update});
game.state.start('main');

const gravCoef = 150000;
const frictionCoef = 0.5;
const groundAcceleration = 30;
const airAcceleration = 5;
const maxHorizontalVelocity = 250;
const jumpVelocity = 650;
const startingLevelNum = 6;
const gravObjAttractionMin = 0;
const gravObjAttractionMax = 2 * gravCoef;
const gravObjStartColor = 0xffffff;
const gravObjEndColor = 0x351777;

let player;
let walls;
let gravObjects;
let enemies;
let sliders;
let wallCollision;
let gravObjectCollision;
let enemyCollision;
let playerCollision;
let cursor;
let levels;
let currentLevelNum;

function preload() {
    game.load.image('player', 'assets/player.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('gravObj', 'assets/gravObj.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('slider', 'assets/slider.png');
    //game.load.text('levelsExternal', 'assets/levels.txt');
    game.load.text('levelsNew', 'assets/levelsNew.txt');
}

function create() {
    game.stage.backgroundColor = '#7ac17c';
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.time.desiredFps = 60;
    //game.physics.startSystem(Phaser.ARCADE);
    //game.world.enableBody = true;
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.world.defaultContactMaterial.friction = 0;
    game.physics.p2.world.defaultContactMaterial.relaxation = 5;
    game.physics.p2.world.defaultContactMaterial.stiffness = 1e7;

    cursor = game.input.keyboard.createCursorKeys();
    let gravToggleBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    gravToggleBtn.onDown.add(toggleGravityAll, this);
    
    player = game.add.sprite(70, 100, 'player');
    
    game.physics.p2.gravity.y = gravCoef / 60;
    game.physics.p2.restitution = 0;

    walls = game.add.group();
    gravObjects = game.add.group();
    enemies = game.add.group();
    sliders = game.add.group();
    
    walls.enableBody = true;
    walls.physicsBodyType = Phaser.Physics.P2JS;
    
    gravObjects.enableBody = true;
    gravObjects.physicsBodyType = Phaser.Physics.P2JS;
    
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.P2JS;
    
    wallCollision = game.physics.p2.createCollisionGroup();
    gravObjectCollision = game.physics.p2.createCollisionGroup();
    enemyCollision = game.physics.p2.createCollisionGroup();
    playerCollision = game.physics.p2.createCollisionGroup();
    
    loadLevelsFromFile();
    
    let selector = $('#level-select');
    currentLevelNum = startingLevelNum;
    
    let atrSelected;
    for(let i = 0; i < levels.length; i++) {
        
        if ( i == currentLevelNum) {
            atrSelected = 'selected';
        } else {
            atrSelected = '';
        }
        
        selector.append('<option ' + atrSelected + ' value="' + i + '">' + i + '</option>');
    }
    
    loadLevel();
}

function loadLevelsFromFile(){
    
    let levelsAll = game.cache.getText('levelsNew').split(';');
    levels = [levelsAll.length];
    for (let i = 0; i < levelsAll.length; i++) {
        levels[i] = levelsAll[i].split('\n')
    }  
}

function clearLevel(){
	walls.removeAll(true);
	enemies.removeAll(true);
	gravObjects.removeAll(true);
	sliders.removeAll(true);

	player.kill();
    player = game.add.sprite(70, 100, 'player');
    
    game.physics.p2.enable(player);
    player.body.setCollisionGroup(playerCollision);
    player.body.collides([wallCollision, gravObjectCollision]);
    player.body.collides(enemyCollision, restart, this);
    player.body.data.gravityScale = 1;
    player.body.fixedRotation = true;
    player.body.damping = .1;
    player.body.data.ccdIterations = 10;
    player.body.data.ccdSpeedThreshold = 1;
}

function selectLevel(){
	// This would be simpler with jquery
	let levelSelector = document.getElementById("level-select");
	currentLevelNum = levelSelector.options[levelSelector.selectedIndex].value;
	loadLevel();
}

function loadLevel(){
	clearLevel();
    
    let level = levels[currentLevelNum];
    if (level == undefined) {
        level = 'gggggggg';
        console.log("Attempted to load undefined level");
    }
    
    level.forEach(function(element) {
        let objectInfo = element.split(',');
        let objectName = objectInfo[0];
        let objectX = parseFloat(objectInfo[1]);
        let objectY = parseFloat(objectInfo[2]);
            
        switch(objectName) {
            case 'wall':
                let wall = game.add.sprite(objectX, objectY, objectName);
                walls.add(wall);
                game.physics.p2.enable(wall);
                wall.body.setCollisionGroup(wallCollision);
                wall.body.collides(playerCollision)
                wall.body.kinematic = true;
                wall.anchor.set(.5,.5);
                break;
            case 'gravObj_off':
                initializeGravObj(objectX, objectY, false);
                break;
            case 'gravObj_on':
                initializeGravObj(objectX, objectY, true);
                break;
            case 'enemy':
                let enemy = game.add.sprite(objectX, objectY, objectName);
                enemy.anchor.set(.5, .5);
                enemies.add(enemy);
                game.physics.p2.enable(enemy);
                enemy.body.data.gravityScale = 0;
                enemy.body.setCollisionGroup(enemyCollision);
                enemy.body.collides(playerCollision, restart, this);
                break;
            default:
                break;
        }
        
    });

}

function update() {
    let onGround = touchingDown(player);
    
    if (cursor.left.isDown) {
        if (onGround) {
            player.body.velocity.x = Math.max(-maxHorizontalVelocity, player.body.velocity.x - groundAcceleration);
        } else {
            player.body.velocity.x -= airAcceleration;
        }
    } else if (cursor.right.isDown) {
        if (onGround) {
            player.body.velocity.x = Math.min(maxHorizontalVelocity, player.body.velocity.x + groundAcceleration);
        } else {
            player.body.velocity.x += airAcceleration;
        }
    } else {
        if (onGround) {
            player.body.velocity.x = player.body.velocity.x * frictionCoef;
        }
    }

    if (cursor.up.isDown && onGround) {
        player.body.velocity.y = -jumpVelocity;
    }    
    
    let xGravCoef = 0;
    let yGravCoef = 0;

    // Gravity object changes
    for (let i = 0;  i < gravObjects.children.length; i++) {
        let obj = gravObjects.children[i];
        
        if (obj.gravOn) {
            let diff = Phaser.Point.subtract(player.position, obj.position);
            let r = diff.getMagnitude();
            diff.normalize();

            xGravCoef += obj.gravWeight * diff.x / Math.pow(r, 1);
            yGravCoef += obj.gravWeight * diff.y / Math.pow(r, 1);
        }
        
        //displays weight of gravity objects
        //game.debug.text(obj.gravWeight/1000, obj.position.x - 15, obj.position.y - 15);
    }
    player.body.force.x += -xGravCoef;
    player.body.force.y += -yGravCoef;
    
}

function restart() {
    loadLevel();
}

function initializeGravObj(x, y, gravOn) {
    let gravObj = game.add.sprite(x, y, 'gravObj');
    let slider = game.add.sprite(x, y, 'slider');

    gravObj.anchor.set(.5, .5);
    game.physics.p2.enable(gravObj);
    gravObj.slider = slider;
    gravObj.gravOn = gravOn ;
    gravObj.gravWeight = gravCoef;
    gravObjects.add(gravObj);
    gravObj.body.kinematic = true;
    gravObj.inputEnabled = true;
    gravObj.events.onInputDown.add(toggleGravity, this);
    gravObj.body.setCollisionGroup(gravObjectCollision);
    gravObj.body.collides([playerCollision]);

    slider.anchor.set(.5, .5);
    slider.gravObj = gravObj;
    slider.inputEnabled = true;
    slider.input.setDragLock(true, false); // can drag horizontally, not vertically
    slider.input.enableDrag();
    slider.events.onDragUpdate.add(updateGravObjFromSlider, this);
    slider.input.boundsRect = new Phaser.Rectangle(-50 + x, -10 + y, 100, 20);

    sliders.add(slider);
    if (gravOn) updateGravObjFromSlider(slider);
}

function toggleGravityAll() {

    for (let i = 0;  i < gravObjects.children.length; i++) {
        let gravObj = gravObjects.children[i];
        toggleGravity(gravObj);
    }
}

function toggleGravity(gravObj) {

    gravObj.gravOn = !gravObj.gravOn;
    if (gravObj.gravOn) {
        updateGravObjFromSlider(gravObj.slider)
    } else {
        gravObj.tint = 0xffffff;
    }
}

function touchingDown(someone) {    
    let yAxis = p2.vec2.fromValues(0, 1);    
    let result = false;    
    for (let i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];
        if (c.bodyA === someone.body.data || c.bodyB === someone.body.data) {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis  
            if (c.bodyA === someone.body.data) {
                d *= -1;
            }
            if (d > 0.5) {
                result = true; 
            }
        }
    } 
    return result;
}

function updateGravObjFromSlider(slider) {
    let gravAmount = (slider.left - slider.input.boundsRect.left) / (slider.input.boundsRect.width - slider.width);
    slider.gravObj.gravWeight = Phaser.Math.linear(gravObjAttractionMin, gravObjAttractionMax, gravAmount);
    if (slider.gravObj.gravOn) {
        slider.gravObj.tint = Phaser.Color.interpolateColor(gravObjStartColor, gravObjEndColor, 1, gravAmount, 0xff);
    }
}

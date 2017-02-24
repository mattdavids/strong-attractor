let game = new Phaser.Game(800, 400);
game.state.add('main', {preload: preload, create: create, update: update});
game.state.start('main');

const gravCoef = 150000;
const frictionCoef = 0.5;
const groundAcceleration = 30;
const airAcceleration = 5;
const maxHorizontalVelocity = 250;
const jumpVelocity = 650;
const startingLevelNum = 3;

let player;
let walls;
let gravObjects;
let enemies;
let sliders;
let cursor;
let levels;
let currentLevelNum;

function preload() {
    game.load.image('player', 'assets/player.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('gravObj_off', 'assets/gravObj_off.png');
    game.load.image('gravObj_on', 'assets/gravObj_on.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('slider', 'assets/slider.png');
    //game.load.text('levelsExternal', 'assets/levels.txt');
    game.load.text('levelsNew', 'assets/levelsNew.txt');

}


function create() {
    game.stage.backgroundColor = '#7ac17c';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;

    cursor = game.input.keyboard.createCursorKeys();
    let gravToggleBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    gravToggleBtn.onDown.add(toggleGravityAll, this);
    
    player = game.add.sprite(70, 100, 'player');
    player.body.gravity.y = 2500;

    walls = game.add.group();
    gravObjects = game.add.group();
    enemies = game.add.group();
    sliders = game.add.group();
    
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
    //let levelsAll = game.cache.getText('levelsExternal').split(',');
    //levels = [levelsAll.length];
    //for (let i = 0; i < levelsAll.length; i++){
    //    levels[i] = levelsAll[i].split('\n');
    //}
    
    let levelsAll = game.cache.getText('levelsNew').split(';');
    levels = [levelsAll.length]
    for (let i = 0; i < levelsAll.length; i++) {
        levels[i] = levelsAll[i].split('\n')
    }
    
}

function clearLevel(){
	walls.removeAll();
	enemies.removeAll();
	gravObjects.removeAll();
	sliders.removeAll();

	player.kill();
    player = game.add.sprite(70, 100, 'player');
    player.body.gravity.y = 2500;
}

function selectLevel(){
	// This would be simpler with jquery
	let levelSelector = document.getElementById("level-select");
	let level = levelSelector.options[levelSelector.selectedIndex].value;

	currentLevelNum = level;
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
        let objectX = parseInt(objectInfo[1]);
        let objectY = parseInt(objectInfo[2]);
            
        switch(objectName){
        case 'wall':
            let wall = game.add.sprite(objectX, objectY, objectName); 
            walls.add(wall);
            wall.body.immovable = true;
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
            break;
        default:
            break;
        }
        
    });

    //for (let i = 0; i < level.length; i++) {
    //    for (let j = 0; j < level[i].length; j++) {
//
    //        if (level[i][j] =='x') {
    //            let wall = game.add.sprite(30 + 20*j, 30 + 20*i, 'wall');
    //            walls.add(wall);
    //            wall.body.immovable = true;
    //        }
//
    //        if (level[i][j] =='g') {
    //            initializeGravObj(i, j, true);
    //        }
    //        
    //        if (level[i][j] =='o') {
    //            initializeGravObj(i, j, false);
    //        }
//
    //        if (level[i][j] =='!') {
    //            let enemy = game.add.sprite(30 + 20*j, 30 + 20*i, 'enemy');
    //            enemies.add(enemy);
    //        }
    //    }
    //}

}

function update() {
    game.physics.arcade.collide(player, walls);
    game.physics.arcade.collide(player, gravObjects);

    //game.physics.arcade.overlap(player, gravObjects, takeCoin, null, this);
    game.physics.arcade.overlap(player, enemies, restart, null, this);

    if (cursor.left.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.max(-maxHorizontalVelocity, player.body.velocity.x - groundAcceleration);
        } else {
            player.body.velocity.x -= airAcceleration;
        }
    } else if (cursor.right.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.min(maxHorizontalVelocity, player.body.velocity.x + groundAcceleration);
        } else {
            player.body.velocity.x += airAcceleration;
        }
    } else {
        if (player.body.touching.down) {
            player.body.velocity.x = player.body.velocity.x * frictionCoef;
        }
    }

    if (cursor.up.isDown && player.body.touching.down) {
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
        game.debug.text(obj.gravWeight/1000, obj.position.x - 15, obj.position.y - 15);
    }
    player.body.acceleration.x = -xGravCoef;
    player.body.acceleration.y = -yGravCoef;
}

function takeCoin(player, coin) {
    coin.kill();
}

function restart() {
    //game.state.start('main');
    loadLevel();
}

function initializeGravObj(i, j, gravOn) {
    let name = gravOn ? 'gravObj_on' : 'gravObj_off';
    let gravObj = game.add.sprite(i, j, name)
    //let gravObj = game.add.sprite(30 + 20*j, 30 + 20*i, name);
    gravObj.gravOn = gravOn ;
    gravObj.gravWeight = gravCoef;
    gravObjects.add(gravObj);
    gravObj.body.immovable = true;
    gravObj.inputEnabled = true;
    gravObj.events.onInputDown.add(toggleGravity, this);
    gravObj.anchor.set(.5, .5);

    let slider = game.add.sprite(i, j, 'slider');
    let bounds = new Phaser.Rectangle(-50 + i, -10 + j, 100, 20);
    let graphic = game.add.graphics(bounds.x, bounds.y);
    graphic.drawRect(0,0,bounds.width, bounds.height);
    slider.lastX = slider.position.x;
    slider.gravObj = gravObj;

    slider.inputEnabled = true;
    slider.anchor.set(.5, .5);
    slider.input.setDragLock(true, false); // can drag horizontally, not vertically
    slider.input.enableDrag();
    slider.events.onDragUpdate.add(dragUpdate, this);
    slider.input.boundsRect = bounds;

    sliders.add(slider);
}

function toggleGravityAll() {

    for (let i = 0;  i < gravObjects.children.length; i++) {
        let sprite = gravObjects.children[i];
        sprite.gravOn = !sprite.gravOn;
        sprite.gravOn
            ? sprite.loadTexture('gravObj_on')
            : sprite.loadTexture('gravObj_off')
    }
}

function toggleGravity(obj) {

    obj.gravOn = !obj.gravOn;
    obj.gravOn
        ? obj.loadTexture('gravObj_on')
        : obj.loadTexture('gravObj_off')
}

function dragUpdate(sObj) {
    sObj.gravObj.gravWeight -= (sObj.lastX - sObj.position.x) * 5000;
    sObj.lastX = sObj.position.x;
}

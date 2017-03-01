let width;
let height;

let game;
let graphic;
let bounds;
let walls;
let enemies;
let gravObj_offs;
let gravObj_ons;
let clickedObj;
let gravObj;
let gravObj_off;
let gravObj_on;

let blockFullSize=30;
let blockHalfSize=blockFullSize/2;
let blockQuarterSize=blockHalfSize/2;

$('.firstSection').hide();

$('#start').click(function() {
    
    let widthBlocks = $('#width')[0].value
    let heightBlocks = $('#height')[0].value
    
    width = widthBlocks * 30;
    height = heightBlocks * 30;
    
    game = new Phaser.Game(width, height, Phaser.CANVAS);
    game.state.add('main', {preload: preload, create: create, update: update});
    game.state.start('main');
    $('.sizeSelect').hide();
    $('.firstSection').show();
});



function preload() {
    game.load.image('wall', 'assets/bricks.png');
    game.load.image('gravObj', 'assets/gravObj.png');
    game.load.image('enemy', 'assets/enemy.png');
    
}

function create() {
    game.stage.backgroundColor = '#dbdbdb';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;
    
    game.canvas.oncontextmenu = function (e) {
        e.preventDefault(); 
    }
    
    bounds = new Phaser.Rectangle(0,0,width, height);
    graphic = game.add.graphics(bounds.x, bounds.y);
    graphic.drawRect(0, 0, bounds.width, bounds.height);


    // Light gridlines at halfway point
    graphic.lineStyle(1, Phaser.Color.hexToRGB("#bcbcbc"), 1);
    for(let x=blockHalfSize; x<width; x+=blockFullSize){
        graphic.moveTo(x,0);
        graphic.lineTo(x,height);
    }
    for(let y=blockHalfSize; y<height; y+=blockFullSize){
        graphic.moveTo(0,y);
        graphic.lineTo(width, y);
    }
    // Heavy gridlines at full point
    graphic.lineStyle(1, Phaser.Color.hexToRGB("#444"), 1);
    for(let x=0; x<width; x+=blockFullSize){
        graphic.moveTo(x,0);
        graphic.lineTo(x,height);
    }
    for(let y=0; y<height; y+=blockFullSize){
        graphic.moveTo(0,y);
        graphic.lineTo(width, y);
    }
    
    walls = game.add.group();
    gravObj_offs = game.add.group();
    gravObj_ons = game.add.group();
    enemies = game.add.group();

    // Make walls around edges
    for (let i = blockHalfSize; i <= width; i += blockFullSize){
        makeWall(i, blockHalfSize);
        makeWall(i, height - blockHalfSize);
    }
    for (let i = blockHalfSize; i < height; i += blockFullSize){
        makeWall(blockHalfSize, i);
        makeWall(width - blockHalfSize, i);
    }

    // Buttons for adding objects to canvas
    let adders = $('.adders');
    adders.show();
    adders.click(function() {
        initializeObj($(this).attr('id'));
    });           
    
    // Display string representation of canvas
    $('#display').click(function(){
        
        let result = game.world.width + ',' + game.world.height + '\n';
        
        for (let i = 0; i < walls.children.length; i++) {
            let obj = walls.children[i];
            result += 'wall,' + obj.position.x + ',' + obj.position.y + '\n'
        }
        for (let i = 0; i < enemies.children.length; i++) {
            let obj = enemies.children[i];
            result += 'enemy,' + obj.position.x + ',' + obj.position.y + '\n'
        }
        for (let i = 0; i < gravObj_offs.children.length; i++) {
            let obj = gravObj_offs.children[i];
            result += 'gravObj_off,' + obj.position.x + ',' + obj.position.y + '\n'
        }
        for (let i = 0; i < gravObj_ons.children.length; i++) {
            let obj = gravObj_ons.children[i];
            result += 'gravObj_on,' + obj.position.x + ',' + obj.position.y + '\n'
        }
        $(this).hide();
        $('.firstSection').remove();
        $('#response').text(result.slice(0,-1));
        game.destroy();
        
    });
    
}

function initializeObj(objectName) {
    let obj;

    // Default spawn at center of area
    // Change this if spawning on click / from mouse position
    let spawnPosX = width/2;
    let spawnPosY = height/2;

    // Move spawn positions to fit major gridlines
    spawnPosX -= spawnPosX%blockFullSize + blockHalfSize;
    spawnPosY -= spawnPosY%blockFullSize + blockHalfSize;

    if (objectName == 'gravObj_off') {
        obj = game.add.sprite(spawnPosX, spawnPosY, 'gravObj');
        obj.tint = 0xffffff;
    } else if (objectName == 'gravObj_on') {
        obj = game.add.sprite(spawnPosX, spawnPosY, 'gravObj');
        obj.tint = 0x351777
    } else {
        obj = game.add.sprite(spawnPosX, spawnPosY, objectName);
    }

    
    obj.inputEnabled = true;
    obj.events.onInputDown.add(deleteObject, this);
    obj.anchor.set(.5, .5);
    //obj.input.enableDrag();
    obj.events.onInputUp.add(inputUp, this);
    
    obj.input.boundsRect = bounds;
    
    switch(objectName){
        case 'wall':
            walls.add(obj);
            break;
        case 'gravObj_off':
            gravObj_offs.add(obj);
            break;
        case 'gravObj_on':
            gravObj_ons.add(obj);
            break;
        case 'enemy':
            enemies.add(obj);
            break;
        default:
            break;
    }
}

function inputUp(obj) {
    // Set dragged object velocity to zero
    obj.body.velocity.x = 0;
    obj.body.velocity.y = 0;

    // Snap to grid
    let diff = obj.body.x % blockHalfSize;
    if(diff >blockQuarterSize)
        diff -=blockHalfSize;
    obj.x-=diff;
    diff = obj.body.y % blockHalfSize;
    if(diff >blockQuarterSize)
        diff -=blockHalfSize;
    obj.y-=diff;

    // Only relevant for collision detection, makes object still on collision
    //obj.body.immovable = true;
    //clickedObj.body.immovable = true;
    clickedObj = null;
}

function makeWall(x, y){
    
    let wall = game.add.sprite(x, y, 'wall');
    wall.inputEnabled = true;
    wall.events.onInputDown.add(deleteObject, this);
    wall.events.onInputUp.add(inputUp, this);
    wall.anchor.set(.5, .5);
    //wall.input.enableDrag();
    wall.input.boundsRect = bounds;
    wall.body.immovable = true;
    walls.add(wall);
    
}

function deleteObject(obj) {
    obj.body.immovable = false;
    if (game.input.activePointer.rightButton.isDown) {
        walls.remove(obj);
	    enemies.remove(obj);
	    gravObj_ons.remove(obj);
        gravObj_offs.remove(obj);
        obj.kill();
    }
    
    clickedObj = obj;
    
}

function update() {
    /*
    game.physics.arcade.collide(walls, walls);
    game.physics.arcade.collide(walls, gravObj_ons);
    game.physics.arcade.collide(walls, gravObj_offs);
    game.physics.arcade.collide(walls, enemies);
    game.physics.arcade.collide(gravObj_ons, gravObj_ons);
    game.physics.arcade.collide(gravObj_ons, gravObj_offs);
    game.physics.arcade.collide(gravObj_ons, enemies);
    game.physics.arcade.collide(gravObj_offs, gravObj_offs);
    game.physics.arcade.collide(gravObj_offs, enemies);
    game.physics.arcade.collide(enemies, enemies);
    //*/
    
    if (game.input.activePointer.leftButton.isDown && clickedObj != null) {
        clickedObj.body.velocity.x = 20 * (game.input.activePointer.position.x - clickedObj.position.x)
        clickedObj.body.velocity.y = 20 * (game.input.activePointer.position.y - clickedObj.position.y)
    }
}

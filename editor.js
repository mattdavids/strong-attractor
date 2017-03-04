const gravCoef = 150000;

let width;
let height;

let game;
let graphic;
let bounds;
let walls;
let coins;
let shockers;
let gravObj_offs;
let gravObj_ons;
let clickedObj;
let gravObj;
let gravObj_off;
let gravObj_on;
let level;
let player_start;

let zoom = false;

let blockFullSize=30;
let blockHalfSize=blockFullSize/2;
let blockQuarterSize=blockHalfSize/2;

$('.firstSection').hide();

$('#start').click(function() {
    
    let widthBlocks = $('#width')[0].value
    let heightBlocks = $('#height')[0].value
    
    
    let input = $('#file')[0];
    let reader = new FileReader();
    if (input.files.length) {
        let textFile = input.files[0];
        
        reader.readAsText(textFile);
        
        $(reader).on('load', function(e) {
            let file = e.target.result;
            
            if(file && file.length) {
                level = file.split('\n'); 

                let boundary = level[0].split(',');
                width = parseInt(boundary[0]);
                height = parseInt(boundary[1]);
                game = new Phaser.Game(width, height, Phaser.CANVAS);
                game.state.add('main', {preload: preload, create: create, update: update});
                game.state.start('main');
            }
        });
    } else {
        
        width = widthBlocks * 30;
        height = heightBlocks * 30;
        
        let levelText = $('#levelText')[0].value
        
        if (levelText) {
            level = levelText.split('\n');
            let boundary = level[0].split(',');
            width = parseInt(boundary[0]);
            height = parseInt(boundary[1]);
        }
        
        game = new Phaser.Game(width, height, Phaser.CANVAS);
        game.state.add('main', {preload: preload, create: create, update: update});
        game.state.start('main');        
    }
    
    $('.sizeSelect').hide();
    $('.firstSection').show(); 
});



function preload() {
    game.load.image('wall', 'assets/bricks_gray.png');
    game.load.image('coin', 'assets/coin.png');
    game.load.image('gravObj', 'assets/gravObj.png');
    game.load.spritesheet('shocker', 'assets/electricity_sprites.png', 30, 30, 3);
    game.load.image('exit', 'assets/exit.png');
    game.load.image('player', 'assets/player.png')
}

function create() {
    game.stage.backgroundColor = '#6970db';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;
    
    game.canvas.oncontextmenu = function (e) {
        e.preventDefault(); 
    }
    
    bounds = new Phaser.Rectangle(0,0,width, height);
    graphic = game.add.graphics(bounds.x, bounds.y);
    graphic.drawRect(0, 0, bounds.width, bounds.height);


    // Light gridlines at halfway point
    graphic.lineStyle(1, Phaser.Color.hexToRGB("#939dff"), 1);
    for(let x=blockHalfSize; x<width; x+=blockFullSize){
        graphic.moveTo(x,0);
        graphic.lineTo(x,height);
    }
    for(let y=blockHalfSize; y<height; y+=blockFullSize){
        graphic.moveTo(0,y);
        graphic.lineTo(width, y);
    }
    // Heavy gridlines at full point
    graphic.lineStyle(1, Phaser.Color.hexToRGB("#f7f7f7"), 1);
    for(let x=0; x<width; x+=blockFullSize){
        graphic.moveTo(x,0);
        graphic.lineTo(x,height);
    }
    for(let y=0; y<height; y+=blockFullSize){
        graphic.moveTo(0,y);
        graphic.lineTo(width, y);
    }
    
    walls = game.add.group();
    coins = game.add.group();
    gravObj_offs = game.add.group();
    gravObj_ons = game.add.group();
    shockers = game.add.group();
    exits = game.add.group();

    
    if (level) {
        for (let i = 1; i < level.length; i++) {
            let element = level[i];
            let objectInfo = element.split(',');
            let objectName = objectInfo[0];
            let objectX = parseFloat(objectInfo[1]);
            let objectY = parseFloat(objectInfo[2]);
            let obj;
            
            switch(objectName) {
                case 'wall':
                    obj = game.add.sprite(objectX, objectY, objectName);
                    walls.add(obj);
                    break;
                case 'gravObj_off':
                    obj = game.add.sprite(objectX, objectY, 'gravObj');
                    obj.gravMin = parseFloat(objectInfo[3]);
                    obj.gravMax = parseFloat(objectInfo[4]);
                    gravObj_offs.add(obj);
                    obj.tint = 0xffffff;
                    break;
                case 'gravObj_on':
                    obj = game.add.sprite(objectX, objectY, 'gravObj');
                    obj.gravMin = parseFloat(objectInfo[3]);
                    obj.gravMax = parseFloat(objectInfo[4]);
                    gravObj_ons.add(obj);
                    obj.tint = 0x351777;
                    break;
                case 'shocker':
                    obj = game.add.sprite(objectX, objectY, objectName);
                    shockers.add(obj);
                    obj.animations.add('crackle');
                    obj.animations.play('crackle', 10, true);
                    break;
                case 'exit':
                    obj = game.add.sprite(objectX, objectY, objectName);
                    exits.add(obj);
                    break;
                case 'coin':
                    obj = game.add.sprite(objectX, objectY, objectName);
                    coins.add(obj);
                    break;
                case 'player':
                    player_start = game.add.sprite(objectX, objectY, objectName);
                    obj = player_start;
                    break;
                default:
                    break;
            }       
            obj.anchor.set(.5,.5);
            obj.inputEnabled = true;
            obj.events.onInputDown.add(deleteObject, this);
            obj.events.onInputUp.add(inputUp, this);
            obj.input.boundsRect = bounds;
        }  
    } else {
        // Make walls around edges
        for (let i = blockHalfSize; i <= width; i += blockFullSize){
            makeWall(i, blockHalfSize);
            makeWall(i, height - blockHalfSize);
        }
        for (let i = blockHalfSize; i < height; i += blockFullSize){
            makeWall(blockHalfSize, i);
            makeWall(width - blockHalfSize, i);
        }
        
        player_start = game.add.sprite(blockFullSize + blockQuarterSize, height - blockFullSize - blockQuarterSize, 'player');
        player_start.anchor.set(.5, .5);
        player_start.inputEnabled = true;
        player_start.events.onInputDown.add(deleteObject, this);
        player_start.events.onInputUp.add(inputUp, this);
        player_start.input.boundsRect = bounds;
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
        for (let i = 0; i < shockers.children.length; i++) {
            let obj = shockers.children[i];
            result += 'shocker,' + obj.position.x + ',' + obj.position.y + '\n'
        }
        for (let i = 0; i < gravObj_offs.children.length; i++) {
            let obj = gravObj_offs.children[i];
            result += 'gravObj_off,' + obj.position.x + ',' + obj.position.y + ',' + obj.gravMin + ',' + obj.gravMax + '\n'
        }
        for (let i = 0; i < gravObj_ons.children.length; i++) {
            let obj = gravObj_ons.children[i];
            result += 'gravObj_on,' + obj.position.x + ',' + obj.position.y + ',' + obj.gravMin + ',' + obj.gravMax + '\n'
        }
        
        exits.children.forEach(function(obj) {
            result += 'exit,' + obj.position.x + ',' + obj.position.y + '\n'
        });
        
        coins.children.forEach(function(obj) {
            result += 'coin,' + obj.position.x + ',' + obj.position.y + '\n'
        });
        
        result += 'player,' + player_start.position.x + ',' + player_start.position.y + '\n';
        
        $(this).hide();
        $('.firstSection').remove();
        $('#response').text(result.slice(0,-1));
        game.destroy();
        
    });
    
    $('#zoom').click(function() {
        if (! zoom) {
            game.scale.maxWidth = window.innerWidth - 15;
            game.scale.maxHeight = window.innerHeight - 100;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            $(this)[0].value = 'Zoom In';
            
        } else {
            game.scale.maxWidth = width;
            game.scale.maxHeight = height;
            game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
            $(this)[0].value = 'Zoom Out';
        }
        zoom = ! zoom;
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
        obj.tint = 0x351777;
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
            obj.gravMin = parseInt($('#gravMin')[0].value);
            obj.gravMax = parseInt($('#gravMax')[0].value);
            break;
        case 'gravObj_on':
            gravObj_ons.add(obj);
            obj.gravMin = parseInt($('#gravMin')[0].value);
            obj.gravMax = parseInt($('#gravMax')[0].value);
            break;
        case 'shocker':
            shockers.add(obj);
            obj.animations.add('crackle');
            obj.animations.play('crackle', 10, true);
            break;
        case 'exit':
            exits.add(obj);
            break;
        case 'coin':
            coins.add(obj);
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
	    shockers.remove(obj);
	    gravObj_ons.remove(obj);
        gravObj_offs.remove(obj);
        if (obj !== player_start) {
            obj.kill();
        }
    }
    
    clickedObj = obj;
    
}

function update() {
    /*
    game.physics.arcade.collide(walls, walls);
    game.physics.arcade.collide(walls, gravObj_ons);
    game.physics.arcade.collide(walls, gravObj_offs);
    game.physics.arcade.collide(walls, shockers);
    game.physics.arcade.collide(gravObj_ons, gravObj_ons);
    game.physics.arcade.collide(gravObj_ons, gravObj_offs);
    game.physics.arcade.collide(gravObj_ons, shockers);
    game.physics.arcade.collide(gravObj_offs, gravObj_offs);
    game.physics.arcade.collide(gravObj_offs, shockers);
    game.physics.arcade.collide(shockers, shockers);
    //*/
    
    if (game.input.activePointer.leftButton.isDown && clickedObj != null) {
        clickedObj.body.velocity.x = 20 * (game.input.activePointer.position.x - clickedObj.position.x)
        clickedObj.body.velocity.y = 20 * (game.input.activePointer.position.y - clickedObj.position.y)
    }
}

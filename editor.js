var height = 400;
var width = 800;
let graphic;
let bounds;
let walls;
let enemies;
let gravObj_offs;
let gravObj_ons;

let game = new Phaser.Game(width, height, Phaser.CANVAS);
game.state.add('main', {preload: preload, create: create, update: update});
game.state.start('main');

function preload() {
    game.load.image('wall', 'assets/wall.png');
    game.load.image('gravObj_off', 'assets/gravObj_off.png');
    game.load.image('gravObj_on', 'assets/gravObj_on.png');
    game.load.image('enemy', 'assets/enemy.png');
    
}

function create() {
    game.stage.backgroundColor = '#7ac17c';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;
    
    game.canvas.oncontextmenu = function (e) {
        e.preventDefault(); 
    }
    
    bounds = new Phaser.Rectangle(0,0,800, 400);
    graphic = game.add.graphics(bounds.x, bounds.y);
    graphic.drawRect(0, 0, bounds.width, bounds.height);
    
    walls = game.add.group();
    gravObj_offs = game.add.group();
    gravObj_ons = game.add.group();
    enemies = game.add.group();

    //Make walls around edges

    for (let i = 0; i < width; i += 30){
        makeWall(i, 15);
        makeWall(i, height - 15);
    }
    for (let i = 0; i < height; i += 30){
        makeWall(15, i);
        makeWall(width - 15, i);
    }

    //Add object that was clicked to canvas
    $('.adders').show();
    $('.adders').click(function() {
        initializeObj($(this).attr('id'));
    });           
    
    //Display string representation of canvas
    $('#display').click(function(){
        
        let result = "";
        
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
    
    let obj = game.add.sprite(width/2, height/2, objectName);
    
    obj.inputEnabled = true;
    obj.events.onInputDown.add(deleteObject, this);
    obj.anchor.set(.5, .5);
    obj.input.enableDrag();
    
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

function makeWall(x, y){
    
    let wall = game.add.sprite(x, y, 'wall');
    wall.inputEnabled = true;
    wall.events.onInputDown.add(deleteObject, this);
    wall.anchor.set(.5, .5);
    wall.input.enableDrag();
    wall.input.boundsRect = bounds;
    walls.add(wall);
    
}

function deleteObject(obj) {
    if (game.input.activePointer.rightButton.isDown) {
        walls.remove(obj);
	    enemies.remove(obj);
	    gravObj_ons.remove(obj);
        gravObj_offs.remove(obj);
        obj.kill();
    }
}

function update() {
    
}

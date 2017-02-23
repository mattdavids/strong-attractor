var gravCoef = 150000;

function preload() {
    game.load.image('player', 'assets/player.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('gravObj_off', 'assets/gravObj_off.png');
    game.load.image('gravObj_on', 'assets/gravObj_on.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('slider', 'assets/slider.png');
    game.load.text('levelsExternal', 'assets/levels.txt');
}

function create() {
    game.stage.backgroundColor = '#7ac17c';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;

    cursor = game.input.keyboard.createCursorKeys();
    gravToggleBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    gravToggleBtn.onDown.add(toggleGravityAll, this);
    
    player = game.add.sprite(70, 100, 'player');
    player.body.gravity.y = 2500;

    walls = game.add.group();
    gravObjects = game.add.group();
    enemies = game.add.group();
    sliders = game.add.group();
    
    var levelsAll = game.cache.getText('levelsExternal').split(',');
    var levels = [levelsAll.length];
    for (var i = 0; i < levelsAll.length; i++){
        levels[i] = levelsAll[i].split('\n');
    }
    
    var level = levels[6];
    
    if (level == undefined) {
        level = 'gggggggg';
    }
    
    var currentID = 0;

    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[i].length; j++) {

            if (level[i][j] =='x') {
                let wall = game.add.sprite(30 + 20*j, 30 + 20*i, 'wall');
                walls.add(wall);
                wall.body.immovable = true;
            }

            if (level[i][j] =='g') {
                let gravObj = game.add.sprite(30 + 20*j, 30 + 20*i, 'gravObj_on');
                gravObj.gravOn = true ;
                gravObj.gravWeight = gravCoef;
                gravObjects.add(gravObj);
                gravObj.body.immovable = true;
                gravObj.inputEnabled = true;
                gravObj.events.onInputDown.add(toggleGravity, this);
                gravObj.ID = currentID;
                
                let slider = game.add.sprite(45 + 20*j, 45 + 20*i, 'slider');
                let bounds = new Phaser.Rectangle(-10 + 20*j, 30 + 20*i, 100, 20);
                let graphic = game.add.graphics(bounds.x, bounds.y);
                graphic.drawRect(0,0,bounds.width, bounds.height);
                slider.initialX = slider.position.x;
                slider.was_dragged = false;
                
                slider.inputEnabled = true;
                slider.anchor.set(.5, .5);
                slider.input.setDragLock(true, false);
                
                slider.input.enableDrag();
                slider.events.onDragUpdate.add(dragUpdate, this);
                slider.input.boundsRect = bounds;
                slider.ID = currentID;
                currentID ++;
            }
            
            if (level[i][j] =='o') {
                let gravObj = game.add.sprite(30 + 20*j, 30 + 20*i, 'gravObj_off');
                gravObj.gravOn = false ;
                gravObj.gravWeight = gravCoef;
                gravObjects.add(gravObj);
                gravObj.body.immovable = true;
                gravObj.inputEnabled = true;
                gravObj.events.onInputDown.add(toggleGravity, this);
                gravObj.ID = currentID;
                
                let slider = game.add.sprite(45 + 20*j, 45 + 20*i, 'slider');
                let bounds = new Phaser.Rectangle(-10 + 20*j, 30 + 20*i, 100, 50);
                let graphic = game.add.graphics(bounds.x, bounds.y);
                graphic.drawRect(0,0,bounds.width, bounds.height);
                slider.initialX = slider.position.x;
                slider.was_dragged = false;
                
                slider.inputEnabled = true;
                slider.anchor.set(.5, .5);
                
                slider.input.enableDrag();
                slider.input.setDragLock(true, false);
                slider.events.onDragUpdate.add(dragUpdate, this);
                slider.input.boundsRect = bounds;
                slider.ID = currentID;
                currentID ++;
                
            }

            if (level[i][j] =='!') {
                let enemy = game.add.sprite(30 + 20*j, 30 + 20*i, 'enemy');
                enemies.add(enemy);
            }
        }
    }
}

function update() {
    game.physics.arcade.collide(player, walls);
    game.physics.arcade.collide(player, gravObjects);

    //game.physics.arcade.overlap(player, gravObjects, takeCoin, null, this);
    game.physics.arcade.overlap(player, enemies, restart, null, this);
    
    var xInertia = 30;
    var yInertia = 30;

    if (cursor.left.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.max(-250, player.body.velocity.x - xInertia);
        } else {
            player.body.velocity.x = Math.max(-250, player.body.velocity.x - 10);
        }
    } else if (cursor.right.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.min(250, player.body.velocity.x + xInertia);
        } else {
            player.body.velocity.x = Math.min(250, player.body.velocity.x + 10);
        }
    } else {
        if (player.body.touching.down) {
            player.body.velocity.x = player.body.velocity.x * .5;
        }
    }

    if (cursor.up.isDown && player.body.touching.down){
        player.body.velocity.y = -650;
    }    
    
    var xGravCoef = 0;
    var yGravCoef = 0;

    // Gravity object changes
    for (let i = 0;  i < gravObjects.children.length; i++) {
        let obj = gravObjects.children[i];
        
        if (obj.gravOn) {
            var diff = Phaser.Point.subtract(player.position, obj.position);
            var r = diff.getMagnitude();
            diff.normalize();

            xGravCoef += obj.gravWeight * diff.x / Math.pow(r, 1);
            yGravCoef += obj.gravWeight * diff.y / Math.pow(r, 1);
        }
        
        game.debug.text(obj.gravWeight/1000, obj.position.x, obj.position.y);
    }
    player.body.acceleration.x = -xGravCoef;
    player.body.acceleration.y = -yGravCoef;
}

function takeCoin(player, coin) {
    coin.kill();
}

function restart() {
    game.state.start('main');
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

        for (let j = 0;  j < gravObjects.children.length; j++) {
            let gObj = gravObjects.children[j];

            if (sObj.ID == gObj.ID) {
            
                gObj.gravWeight -= (sObj.initialX - sObj.position.x) * 5000;
                sObj.initialX = sObj.position.x;
            }

        }
    }

var game = new Phaser.Game(800, 400);
game.state.add('main', {preload: preload, create: create, update: update});
game.state.start('main');

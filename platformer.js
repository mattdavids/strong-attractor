function preload() {
    game.load.image('player', 'assets/player.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('gravObj', 'assets/gravObj.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.text('levelsExternal', 'assets/levels.txt');
}

function create() {
    game.stage.backgroundColor = '#7ac17c';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;

    cursor = game.input.keyboard.createCursorKeys();

    player = game.add.sprite(70, 100, 'player');
    player.body.gravity.y = 2500;

    walls = game.add.group();
    gravObjects = game.add.group();
    enemies = game.add.group();
    
    var levelsAll = game.cache.getText('levelsExternal').split(',');
    var levels = [levelsAll.length];
    for (var i = 0; i < levelsAll.length; i++){
        levels[i] = levelsAll[i].split('\n');
    }
    
    var level = levels[5];
    

    for (var i = 0; i< level.length; i++) {
        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] =='x') {
                var wall = game.add.sprite(30 + 20*j, 30 + 20*i, 'wall');
                walls.add(wall);
                wall.body.immovable = true;
            }

            if (level[i][j] =='o') {
                var gravObj = game.add.sprite(30 + 20*j, 30 + 20*i, 'gravObj');
                gravObjects.add(gravObj);
                gravObj.body.immovable = true;
            }

            if (level[i][j] =='!') {
                var enemy = game.add.sprite(30 + 20*j, 30 + 20*i, 'enemy');
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

    if (cursor.left.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.max(-250, player.body.velocity.x - 15);
        } else {
            player.body.velocity.x = Math.max(-250, player.body.velocity.x - 10);
        }
    } else if (cursor.right.isDown) {
        if (player.body.touching.down) {
            player.body.velocity.x = Math.min(250, player.body.velocity.x + 15);
        } else {
            player.body.velocity.x = Math.min(250, player.body.velocity.x + 10);
        }
    } else {
        if (player.body.touching.down) {
            player.body.velocity.x = player.body.velocity.x * .8;
        }
    }

    if (cursor.up.isDown && player.body.touching.down){
        player.body.velocity.y = -500;
    }

    var gravCoef = 150000;
    var xGravCoef = 0;
    var yGravCoef = 0;

    // Gravity object changes
    for(var i = 0, len = gravObjects.children.length; i < len; i++) {
        var obj = gravObjects.children[i];
        var diff = Phaser.Point.subtract(player.position, obj.position);
        var r = diff.getMagnitude();
        diff.normalize();

        var xGrav = gravCoef * diff.x / Math.pow(r, 1);
        var yGrav = gravCoef * diff.y / Math.pow(r, 1);

        xGravCoef += xGrav;
        yGravCoef += yGrav;

    }
    player.body.acceleration.x = - xGravCoef;
    player.body.acceleration.y = - yGravCoef;
}

function takeCoin(player, coin) {
    coin.kill();
}

function restart() {
    game.state.start('main');
}

var game = new Phaser.Game(800, 400);
game.state.add('main', {preload: preload, create: create, update: update});
game.state.start('main');

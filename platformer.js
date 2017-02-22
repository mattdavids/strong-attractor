var mainState = {
    preload: function() {
        
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('gravObj', 'assets/coin.png');
        game.load.image('enemy', 'assets/enemy.png');
        
    },
    
    create: function() {
        
        game.stage.backgroundColor = '#7ac17c';
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.world.enableBody = true;
        
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.player = game.add.sprite(70, 100, 'player');
        
        this.player.body.gravity.y = 2500;
        
        this.walls = game.add.group();
        this.gravObjects = game.add.group();
        this.enemies = game.add.group();
        
        var levels = [[
            'xxxxxxxxxxxxxxxxxxxxxx',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!          o         x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            'xxxxxxxx!!!!!!!xxxxxxx',
        ], [
            'xxxxxxxxxxxxxxxxxxxxxx',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            '!                    x',
            'xxxxxxxx!!!!!!!xxxxxxx',
        ], [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                  o               x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'xxxxxxxxxxxxxxx!!!!!!!!xxxxxxxxxxxxx',
           ], [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'xxxxxxxxxxxxxxx!!!!!!!!xxxxxxxxxxxxx',
           ], [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                  o               x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x           xxx         xxx        x',
            'x          xxxx         xxxx       x',
            'xxxxxxxxxxxxxxx!!!!!!!!!xxxxxxxxxxxx',
           ], [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x                                  x',
            'x           xxx         xxx        x',
            'x          xxxx         xxxx       x',
            'xxxxxxxxxxxxxxx!!!!!!!!!xxxxxxxxxxxx',
           ]];
        
        var level = levels[5];
        
        for (var i = 0; i< level.length; i++){
            for (var j = 0; j < level[i].length; j++){
                
                if(level[i][j] =='x'){
                    var wall = game.add.sprite(30 + 20*j, 30 + 20*i, 'wall');
                    this.walls.add(wall);
                    wall.body.immovable = true;
                }
                
                if(level[i][j] =='o'){
                    var gravObj = game.add.sprite(30 + 20*j, 30 + 20*i, 'gravObj');
                    this.gravObjects.add(gravObj);
                    gravObj.body.immovable = true;
                }
                
                if(level[i][j] =='!'){
                    var enemy = game.add.sprite(30 + 20*j, 30 + 20*i, 'enemy');
                    this.enemies.add(enemy);
                }
            }
        }
        
    },
    
    update: function() {
        
        
        game.physics.arcade.collide(this.player, this.walls);
        
        game.physics.arcade.collide(this.player, this.gravObjects);
        
        //game.physics.arcade.overlap(this.player, this.gravObjects, this.takeCoin, null, this);
        
        game.physics.arcade.overlap(this.player, this.enemies, this.restart, null, this);
        
        if (this.cursor.left.isDown){
            if (this.player.body.touching.down){
                this.player.body.velocity.x = Math.max(-250, this.player.body.velocity.x - 15);
            } else{
                this.player.body.velocity.x = Math.max(-250, this.player.body.velocity.x - 10);
            }
        } else if (this.cursor.right.isDown){
            if (this.player.body.touching.down){
                this.player.body.velocity.x = Math.min(250, this.player.body.velocity.x + 15);
            } else{
                this.player.body.velocity.x = Math.min(250, this.player.body.velocity.x + 10);
            }            
        } else{            
            if (this.player.body.touching.down){               
                this.player.body.velocity.x = this.player.body.velocity.x * .8;
            }
        }     
        if (this.cursor.up.isDown && this.player.body.touching.down){
            this.player.body.velocity.y = -500;
        }
        
        var gravCoef = 150000;
        
        var xGravCoef = 0;
        
        var yGravCoef = 0;
        
        // Gravity object changes
        for(var i=0, len = this.gravObjects.children.length; i < len; i++){
            
            var obj = this.gravObjects.children[i];
            
            var radius = Phaser.Math.distance(obj.position.x, obj.position.y, this.player.position.x, this.player.position.y);
            
            var theta = Phaser.Math.angleBetween(obj.position.x, obj.position.y, this.player.position.x, this.player.position.y);
            
            var xGrav = (gravCoef*Math.cos(theta))/(radius^2);
            var yGrav = (gravCoef*Math.sin(theta))/(radius^2);
            
            xGravCoef += xGrav;
            yGravCoef += yGrav;            
            
        }
        
        this.player.body.acceleration.x = - xGravCoef;
        this.player.body.acceleration.y = - yGravCoef;
        
    },
    
    takeCoin: function(player, coin){
        coin.kill();
    },
    
    restart: function(){
        game.state.start('main');
    },
    
};

var game = new Phaser.Game(800, 400);
game.state.add('main', mainState);
game.state.start('main');
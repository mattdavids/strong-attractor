let Game = function (game) {
    this.game = game;
};

Game.prototype = (function() {

    const jumpFrames = 10;

    // Physics
    const gravCoef = 150000;
    const frictionCoef = 0.5;
    const groundAcceleration = 30;
    const airAcceleration = 5;
    const maxHorizontalVelocity = 250;
    const jumpVelocity = 300;

    // Display
    const gravObjColor = 0x351777;
    const circleRadius = 259;

    const pauseAnimationSpeed = 50;

    function setupPauseButton() {
        let game = this.game,
            shockers = this.shockers,
            stopPauseAnimation = this.stopPauseAnimation,
            pausedSize = this.pausedSize;

        this.pauseBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        this.pauseBtn.onDown.add(function() {
            shockers.children.forEach(function(ele) {
                ele.animations.paused = ! ele.animations.paused;
            });
            game.physics.arcade.isPaused = ! game.physics.arcade.isPaused;

            if (! game.physics.arcade.isPaused) {
                stopPauseAnimation = true;
                pausedSize = Math.max(game.width, game.height);
            } else {
                pausedSize = pauseAnimationSpeed;
            }

        }, this);
    }

    function preload() {
        let game = this.game;

        game.load.image('player', 'assets/art/player.png');
        game.load.image('exit', 'assets/art/exit.png');
        game.load.image('wall', 'assets/art/bricks_gray.png');
        game.load.image('gravObj', 'assets/art/gravObj.png');
        game.load.image('shadow', 'assets/art/shadow.png');

        game.load.spritesheet('shocker', 'assets/art/electricity_sprites.png', 30, 30, 3);

        this.levelLoader = new LevelLoader(this);
        this.levelLoader.setup();
        this.currentLevelNum = 0;
    }

    function create() {
        let game = this.game,
            levelLoader = this.levelLoader;

        game.stage.backgroundColor = '#faebd7';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        this.graphics = game.add.graphics();

        levelLoader.loadLevel(this.currentLevelNum);
        let gravObjects = this.gravObjects;
        let player = this.player;

        setupPauseButton.call(this);
        //makeLevelSelector();

        this.playerShadowLeft = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        this.playerShadowLeft.anchor.set(.5, .5);
        this.playerShadowLeft.body.setSize(5, 1, 0, 8);

        this.playerShadowRight = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        this.playerShadowRight.anchor.set(.5, .5);
        this.playerShadowRight.body.setSize(15, 1, 0, 8);

        this.playerShadowBottom = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        this.playerShadowBottom.anchor.set(.5, .5);
        this.playerShadowBottom.body.setSize(15, 1, 0, 14);

        this.playerShadowTop = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        this.playerShadowTop.anchor.set(.5, .5);
        this.playerShadowTop.body.setSize(13, 1, 0, 0);
    }

    /*function makeLevelSelector(){

        let selector = $('#level-select');

        let atrSelected;
        for(let i = 0; i < levelCount; i++) {

            if ( i === currentLevelNum) {
                atrSelected = 'selected';
            } else {
                atrSelected = '';
            }

            selector.append('<option ' + atrSelected + ' value="' + i + '">' + i + '</option>');
        }
    }*/

    function update() {
        let game = this.game,
            player = this.player,
            walls = this.walls,
            gravObjects = this.gravObjects,
            shockers = this.shockers,
            exits = this.exits,
            playerShadowLeft = this.playerShadowLeft,
            playerShadowRight = this.playerShadowRight,
            playerShadowBottom = this.playerShadowBottom,
            playerShadowTop = this.playerShadowTop,
            clickedObj = this.clickedObj;





        game.physics.arcade.collide(player, walls);

        let isTouchingRight = false;
        let isTouchingLeft = false;
        let isTouchingBottom = false;
        let isTouchingTop = false;

        playerShadowLeft.body.position.set(player.body.position.x - 2, player.body.position.y);
        playerShadowRight.body.position.set(player.body.position.x + .5, player.body.position.y);
        playerShadowBottom.body.position.set(player.body.position.x, player.body.position.y + 15);
        playerShadowTop.body.position.set(player.body.position.x + 1, player.body.position.y - 17);

        game.physics.arcade.overlap(playerShadowRight, walls, function() {
            isTouchingRight = true;
        }, null, this);
        game.physics.arcade.overlap(playerShadowLeft, walls, function() {
            isTouchingLeft = true;
        }, null, this);
        game.physics.arcade.overlap(playerShadowBottom, walls, function() {
            isTouchingBottom = true;
        }, null, this);
        game.physics.arcade.overlap(playerShadowTop, walls, function() {
            isTouchingTop = true;
        }, null, this);

        game.physics.arcade.collide(player, gravObjects);

        game.physics.arcade.overlap(player, shockers, diedDecider, null, this);
        game.physics.arcade.overlap(player, exits, exitDecider, null, this);

        // Adjust attraction of clicked object
        if (game.input.activePointer.leftButton.isDown && clickedObj !== undefined) {
            clickedObj.gravWeight = Math.min(clickedObj.gravMax, clickedObj.gravWeight + 5000)
        }
        if (game.input.activePointer.rightButton.isDown && clickedObj !== undefined) {
            clickedObj.gravWeight = Math.max(clickedObj.gravMin, clickedObj.gravWeight - 5000)
        }




        if (! game.physics.arcade.isPaused){

            if (game.input.keyboard.isDown(Phaser.KeyCode.A)) {
                if (player.body.touching.down) {
                    player.body.velocity.x = Math.max(-maxHorizontalVelocity, player.body.velocity.x - groundAcceleration);
                } else {
                    player.body.velocity.x -= airAcceleration;
                }
            } else if (game.input.keyboard.isDown(Phaser.KeyCode.D)) {
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

            if (player.body.velocity.x < 0 && isTouchingLeft) {
                player.body.velocity.x = 0;
            }
            if (player.body.velocity.x > 0 && isTouchingRight) {
                player.body.velocity.x = 0;
            }

            //If just landed on top of a block under another, get out of the wall and keep moving
            if ((player.body.touching.down || isTouchingBottom) && this.isJumping && (isTouchingLeft || isTouchingRight)) {
                player.body.velocity.x = isTouchingLeft * groundAcceleration - isTouchingRight * groundAcceleration;
                player.body.velocity.y = this.previous_velocity_y;
            }

            //If stuck in a wall, get out of the wall and keep moving
            if ((player.body.touching.down || isTouchingBottom) && isTouchingTop && this.isJumping) {
                player.body.velocity.x = isTouchingLeft * groundAcceleration - isTouchingRight * groundAcceleration;
                player.x = player.x + isTouchingLeft * ((blockSize/2) - (player.body.left % (blockSize/2))) - isTouchingRight * (player.body.right % (blockSize/2));
                if (player.body.velocity.y === 0) {
                    player.body.velocity.y = this.previous_velocity_y;
                }
            }

            if (game.input.keyboard.isDown(Phaser.KeyCode.W) && isTouchingBottom && player.body.touching.down && ! isTouchingTop && ! this.isJumping) {
                player.body.velocity.y = -jumpVelocity;
                this.jumpCount = 0;
                this.isJumping = true;
            }
            //Let user jump higher if they hold the button down
            if (this.jumpCount < jumpFrames) {
                if (game.input.keyboard.isDown(Phaser.KeyCode.W)) {
                    player.body.velocity.y -= jumpVelocity/(jumpFrames - 3)
                } else {
                    this.jumpCount = jumpFrames;
                }

            }

            this.jumpCount += 1;

            let xGravCoef = 0;
            let yGravCoef = 0;

            // Gravity object changes
            for (let i = 0;  i < gravObjects.children.length; i++) {
                let gravObj = gravObjects.children[i];

                if (gravObj.gravOn) {
                    let diff = Phaser.Point.subtract(player.position, gravObj.position);
                    let r = diff.getMagnitude();
                    diff.normalize();

                    if ( r < (gravObj.gravWeight / gravCoef) * circleRadius) {
                        xGravCoef += gravObj.gravWeight * diff.x / r;
                        yGravCoef += gravObj.gravWeight * diff.y / r;
                    }
                }

                if (gravObj.flux) {
                    gravObj.gravWeight += 2000 * gravObj.fluxConst;
                    if (gravObj.gravWeight >= gravObj.gravMax || gravObj.gravWeight <= gravObj.gravMin) {
                        gravObj.fluxConst *= -1;
                    }
                }

                if (gravObj.moving) {
                    let loc = gravObj.body.position;
                    let movementList = gravObj.movementList;
                    let movementIndex = gravObj.movementIndex;
                    let movingToX = movementList[movementIndex].split('#')[0] - 15;
                    let movingToY = movementList[movementIndex].split('#')[1] - 15;

                    if (parseInt(loc.x) === movingToX && parseInt(loc.y) === movingToY) {
                        gravObj.movementIndex = (movementIndex + 1) % movementList.length;
                    } else {
                        gravObj.body.velocity.x = (loc.x < movingToX) * 30 - (loc.x > movingToX) * 30;
                        gravObj.body.velocity.y = (loc.y < movingToY) * 30 - (loc.y > movingToY) * 30;
                    }
                }
            }
            if (xGravCoef > 0) {
                player.body.acceleration.x = -xGravCoef * !isTouchingLeft;
            } else {
                player.body.acceleration.x = -xGravCoef * !isTouchingRight;
            }

            player.body.acceleration.y = -yGravCoef;

            this.previous_velocity_y = player.body.velocity.y;

            this.isJumping = ! isTouchingBottom;

        }
    }

    function render() {
        let game = this.game,
            graphics = this.graphics,
            gravObjects = this.gravObjects;

        let drawGravObjCircle = function(gravObj) {
            // these are heuristic constants which look okay
            if (gravObj.gravOn) {
                let subAmount = 50;
                let radius = (gravObj.gravWeight / gravCoef) * (circleRadius * 2);
                let alpha = 0.1;
                let fillColor = gravObj.gravOn ? gravObjColor : 0x808080;
                while (radius > 0) {
                    graphics.beginFill(fillColor, alpha);
                    graphics.drawCircle(gravObj.x, gravObj.y, radius);
                    graphics.endFill();
                    radius -= subAmount;
                }
            }
        };
        graphics.clear();
        gravObjects.children.forEach(drawGravObjCircle);

        if (game.physics.arcade.isPaused || stopPauseAnimation) {
            graphics.beginFill(0xa3c6ff, .5);
            graphics.drawRect(player.body.position.x - pausedSize, player.body.position.y - pausedSize, 2 * pausedSize, 2 * pausedSize);
            graphics.endFill();

            if (this.stopPauseAnimation) {
                if (this.pausedSize > this.pauseAnimationSpeed) {
                    this.pausedSize -= this.pauseAnimationSpeed;
                } else {
                    this.stopPauseAnimation = false;
                }
            } else if (this.pausedSize < Math.max(game.width, game.height)) {
                this.pausedSize += this.pauseAnimationSpeed;
            }
        }
    }

    function clearLevel() {
        this.player.kill();
        this.walls.removeAll(true);
        this.shockers.removeAll(true);
        this.gravObjects.removeAll(true);
        this.exits.removeAll(true);
    }

    function setupGravityObjects() {
        let that = this;
        this.gravObjects.children.forEach(function(gravObj) {
            if (! gravObj.flux && ! gravObj.moving) {
                gravObj.events.onInputDown.add(startGravityClick, that);
                gravObj.events.onInputUp.add(function() {
                    this.clickedObj = undefined;
                }, this);
            }
        });
    }

    function diedDecider() {
        clearLevel.call(this);
        this.levelLoader.loadLevel(this.currentLevelNum);
        setupGravityObjects.call(this);
    }

    function exitDecider() {
        let game = this.game;
        clearLevel.call(this);
        if (this.currentLevelNum + 1 === this.levelCount) {
            game.state.start('win');
        } else {
            this.currentLevelNum++;
            this.levelLoader.loadLevel(this.currentLevelNum);
            setupGravityObjects.call(this);
        }
    }

    function startGravityClick(gravObj) {
        let game = this.game;

        if (game.input.activePointer.rightButton.isDown) {
            if (! gravObj.secondClick) {
                gravObj.secondClick = true;
                game.time.events.add(300, function() {
                    gravObj.secondClick = false;
                }, this);

            } else {
                gravObj.gravWeight = 0;
            }
        }

        this.clickedObj = gravObj;
    }

    return {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
})();
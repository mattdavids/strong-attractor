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
    const millisecondsPerFrame = 100/6;

    // Display
    const gravObjColor = 0x351777;
    const circleRadius = 259;
    const blockSize = 30;
    const selectedObjWidth = 8;

    const pauseAnimationSpeed = 50;
    const deathFallSpeed = 6;
    const deathAnimationTime = 300;

    function setupPauseButton(){
        let game = this.game;
        pauseBtn = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        pauseBtn.onDown.add(function() {
            if (notCurrentlyDying) {
                this.shockers.children.forEach(function(ele) {
                    ele.animations.paused = ! ele.animations.paused;
                });
                game.physics.arcade.isPaused = ! game.physics.arcade.isPaused;

                if (! game.physics.arcade.isPaused) {
                    this.stopPauseAnimation = true;
                    this.pausedSize = game.width;
                    game.time.events.resume();
                    selectableGravObjects.length = 0;
                } else {
                    this.pausedSize = pauseAnimationSpeed;
                    game.time.events.pause();
                    handleGravObjSelection.call(this);
        
                }
            }

        }, this);
    }

    function handleGravObjSelection() {
        let game = this.game,
            player = this.player;
        
        // Place all objects currently on the screen into a list
        this.gravObjects.forEach(function(gravObj) {
            if ((gravObj.x + 10 < game.camera.x + game.width) && (gravObj.x - 10 > game.camera.x) && (gravObj.y  + 10 < game.camera.y + game.height) && (gravObj.y - 10> game.camera.y)) {
                selectableGravObjects.push(gravObj);
            }
        });
        
        // Sort the objects from left to right
        selectableGravObjects.sort(function(a, b) {
            if (a.x < b.x) {
                return -1;
            } else {
                return 1;
            }
        });

        // Find the closest object to the player and make it the selected one
        let currentMinObjIndex = 0;
        for(i = 0; i < selectableGravObjects.length; i ++) {
            let gravObj = selectableGravObjects[i];
            
            let diff_1 = Phaser.Point.subtract(player.position, gravObj.position);
            let r_1 = diff_1.getMagnitude();
            
            let diff_2 = Phaser.Point.subtract(player.position, selectableGravObjects[currentMinObjIndex].position);
            let r_2 = diff_2.getMagnitude();
            
            if (r_1 < r_2) {
                currentMinObjIndex = i;
            }
        }

        
        currentHighlightedObjIndex = currentMinObjIndex;
    }
    
    function preload() {
        let game = this.game;

        game.load.image('player', 'assets/art/player.png');
        game.load.image('exit', 'assets/art/exit.png');
        game.load.image('wall', 'assets/art/bricks_gray.png');
        game.load.image('gravObj', 'assets/art/gravObj.png');
        game.load.image('shadow', 'assets/art/shadow.png');
        game.load.image('groundParticle', 'assets/art/groundParticle.png')

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
        
        game.input.keyboard.onUpCallback = function (event) {
            if (event.keyCode == Phaser.Keyboard.RIGHT) {
                rightKeyWasPressed = true;
            }
            if (event.keyCode == Phaser.Keyboard.LEFT) {
                leftKeyWasPressed = true;
            }
        }
        
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
        
        notCurrentlyDying = true;
        deathFall = false;
        
        rightKeyWasPressed = false;
        leftKeyWasPressed = false;
            
        selectableGravObjects = [];
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
            clickedObj = this.clickedObj;
        
        // Move the player in a parabolic death animation when dead, 
        // Reset the game when the player falls below the game window
        if (deathFall) {
            doDeathFallAnimation.call(this);
        }
        updatePlayerCollision.call(this);

        // If the player is not dead, play the death animation on contact with shockers
        // Don't allow player to change the gravity while dead
        if (notCurrentlyDying){
            game.physics.arcade.overlap(this.player, this.shockers, deathAnimation, null, this);
        }
        if (! game.physics.arcade.isPaused){
            doPlayerMovement.call(this);
            // When the player hits the ground after jumping, play a you hit the ground particle effect
            doHitGroundAnimation.call(this);
            checkWallCollision.call(this);
            doJumpPhysics.call(this);
            doGravityPhysics.call(this);

            this.previous_velocity_y = this.player.body.velocity.y;

            this.isJumping = ! this.player.isTouchingBottom;
            
            rightKeyWasPressed = false;
            leftKeyWasPressed = false;

        } else {
            // If time is frozen, keep the particles in the same state until time is unfrozen
            this.emitters.forEach(function(emitter) {
                emitter.forEachAlive(function(p) {
                    p.lifespan += millisecondsPerFrame;
                });
            });
            
            if (notCurrentlyDying) {
                // Adjust attraction of clicked object
                adjustAttractorsPull.call(this);  
            }
        }
    }

    function render() {
        let game = this.game,
            graphics = this.graphics,
            gravObjects = this.gravObjects,
            player = this.player;

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

        if ((game.physics.arcade.isPaused && notCurrentlyDying) || this.stopPauseAnimation) {
            graphics.beginFill(0xa3c6ff, .5);
            graphics.drawRect(player.x - this.pausedSize + player.body.velocity.x/15, player.y - this.pausedSize + player.body.velocity.y/15, 2 * this.pausedSize, 2 * this.pausedSize);
            graphics.endFill();

            if (this.stopPauseAnimation) {
                if (this.pausedSize > pauseAnimationSpeed) {
                    this.pausedSize -= pauseAnimationSpeed;
                } else {
                    this.stopPauseAnimation = false;
                }
            } else if (this.pausedSize < game.width) {
                this.pausedSize += pauseAnimationSpeed;
            }
        }
        
        if (selectableGravObjects.length > 0) {
          
            let selectedObj = selectableGravObjects[currentHighlightedObjIndex];
            graphics.beginFill(0xffffff, 1);
            graphics.drawRect(selectedObj.x - 15, selectedObj.y - 15, selectedObjWidth, 30);
            graphics.drawRect(selectedObj.x - 15, selectedObj.y - 15, 30, selectedObjWidth);
            graphics.drawRect(selectedObj.x - 15, selectedObj.y + 15 - selectedObjWidth, 30, selectedObjWidth);
            graphics.drawRect(selectedObj.x + 15 - selectedObjWidth, selectedObj.y - 15, selectedObjWidth, 30);

        }
        
        game.world.bringToTop(graphics);
    }

    function clearLevel() {
        this.player.kill();
        this.walls.removeAll(true);
        this.shockers.removeAll(true);
        this.gravObjects.removeAll(true);
        this.exits.removeAll(true);
    }

    function updatePlayerCollision() {
        let player = this.player,
            game = this.game;
        game.physics.arcade.collide(this.emitters, this.walls);
        game.physics.arcade.collide(player, this.walls);       
        game.physics.arcade.collide(player, this.gravObjects);
        game.physics.arcade.overlap(player, this.exits, exitDecider, null, this);

        player.isTouchingRight = false;
        player.isTouchingLeft = false;
        player.isTouchingBottom = false;
        player.isTouchingTop = false;

        this.playerShadowLeft.body.position.set(player.body.position.x - 2, player.body.position.y);
        this.playerShadowRight.body.position.set(player.body.position.x + .5, player.body.position.y);
        this.playerShadowBottom.body.position.set(player.body.position.x - 1, player.body.position.y + 15);
        this.playerShadowTop.body.position.set(player.body.position.x + 1, player.body.position.y - 17);

        game.physics.arcade.overlap(this.playerShadowRight, this.walls, function() {
            player.isTouchingRight = true;
        }, null, this);
        game.physics.arcade.overlap(this.playerShadowLeft, this.walls, function() {
            player.isTouchingLeft = true;
        }, null, this);
        game.physics.arcade.overlap(this.playerShadowBottom, this.walls, function() {
            player.isTouchingBottom = true;
        }, null, this);
        game.physics.arcade.overlap(this.playerShadowTop, this.walls, function() {
            player.isTouchingTop = true;
        }, null, this);
    }
    
    function adjustAttractorsPull() {
        let game = this.game,
            clickedObj = this.clickedObj;
        if (game.input.activePointer.leftButton.isDown && clickedObj != null) {
            clickedObj.gravWeight = Math.min(clickedObj.gravMax, clickedObj.gravWeight + 5000)
        }
        if (game.input.activePointer.rightButton.isDown && clickedObj != null) {
            clickedObj.gravWeight = Math.max(clickedObj.gravMin, clickedObj.gravWeight - 5000)
        }
        
        if (rightKeyWasPressed) {
            currentHighlightedObjIndex = (currentHighlightedObjIndex + 1) % selectableGravObjects.length;
            rightKeyWasPressed = false;
        }
        if (leftKeyWasPressed) {
            currentHighlightedObjIndex = (currentHighlightedObjIndex - 1) % selectableGravObjects.length;
            if (currentHighlightedObjIndex == -1) {
                currentHighlightedObjIndex = selectableGravObjects.length - 1;
            }
            leftKeyWasPressed = false;
        }
        if (game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
            let obj = selectableGravObjects[currentHighlightedObjIndex];
            obj.gravWeight = Math.min(obj.gravMax, obj.gravWeight + 5000);
        }
        if (game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            let obj = selectableGravObjects[currentHighlightedObjIndex];
            obj.gravWeight = Math.max(obj.gravMin, obj.gravWeight - 5000);
        }
    }
    
    function doPlayerMovement(){
        let player = this.player,
            game = this.game;
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

        if (player.body.velocity.x < 0 && player.isTouchingLeft) {
            player.body.velocity.x = 0;
        }
        if (player.body.velocity.x > 0 && player.isTouchingRight) {
            player.body.velocity.x = 0;
        }
    }
    
    function doHitGroundAnimation() {
        let player = this.player,
            game = this.game;
        if (this.isJumping && player.isTouchingBottom) {
            let emitter = game.add.emitter(player.x + player.body.velocity.x/14, player.bottom + 2);
            emitter.makeParticles('groundParticle', 0, 15, true);
            emitter.gravity = 300;
            emitter.width = 20;
            emitter.setYSpeed(-100);
            emitter.start(true, 500, null, 15);
            game.time.events.add(1000, function() {
                emitter.destroy();
            });
            this.emitters.add(emitter);
            game.world.bringToTop(this.emitters);
        }

        // Fade out the particles over their lifespan
        this.emitters.forEach(function(emitter) {
            emitter.forEachAlive(function(p) {
                //p.alpha = p.lifespan / emitter.lifespan;
                p.alpha = (-Math.pow(emitter.lifespan - p.lifespan, 2)/Math.pow(emitter.lifespan, 2)) + 1;
            });
        }); 
    }
    
    function checkWallCollision() {
        let player = this.player;
        //If just landed on top of a block under another, get out of the wall and keep moving
        if ((player.body.touching.down || player.isTouchingBottom) && this.isJumping && (player.isTouchingLeft || player.isTouchingRight)) {
            player.body.velocity.x = player.isTouchingLeft * groundAcceleration - player.isTouchingRight * groundAcceleration;
            player.body.velocity.y = this.previous_velocity_y;
        }

        //If stuck in a wall, get out of the wall and keep moving
        if ((player.body.touching.down || player.isTouchingBottom) && player.isTouchingTop && this.isJumping) {
            player.body.velocity.x = player.isTouchingLeft * groundAcceleration - player.isTouchingRight * groundAcceleration;
            player.x = player.x + player.isTouchingLeft * ((blockSize/2) - (player.body.left % (blockSize/2))) - player.isTouchingRight * (player.body.right % (blockSize/2));
            if (player.body.velocity.y === 0) {
                player.body.velocity.y = this.previous_velocity_y;
            }
        }
    }
    
    function doJumpPhysics() {   
        let player = this.player,
            game = this.game;
        if (game.input.keyboard.isDown(Phaser.KeyCode.W) && player.isTouchingBottom && player.body.touching.down && ! player.isTouchingTop && ! this.isJumping) {
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
    
    function doGravityPhysics(){
        
        let player = this.player,
            gravObjects = this.gravObjects;
        
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
            player.body.acceleration.x = -xGravCoef * !player.isTouchingLeft;
        } else {
            player.body.acceleration.x = -xGravCoef * !player.isTouchingRight;
        }

        player.body.acceleration.y = -yGravCoef;
    }

    // Starts the death animation by setting flags. Freezes the player, pauses the game state, shakes the screen, then sets a timer to set the deathFall flag which is run in update
    function deathAnimation() {
        let game = this.game;
        notCurrentlyDying = false;
        game.physics.arcade.isPaused = true;
        this.player.body.allowGravity = false;
        this.player.body.velocity = new Phaser.Point(0, 0);
        game.time.events.add(0, function() {
            game.camera.shake(.008, deathAnimationTime);
        });
        game.time.events.add(deathAnimationTime + 100, function() {
            deathFall = true;
            deathCounter = 0;
        });
    }
    
    function doDeathFallAnimation() {
        if (Math.abs((Math.pow(deathCounter - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)) > blockSize) {
            var movement = blockSize;
        } else {
            var movement = (Math.pow(deathCounter - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)
        }
        this.player.y = this.player.y + movement;
        if (this.player.y > this.game.world.height + 3 * blockSize) {
            deathFall = false;
            notCurrentlyDying = true;
            this.game.physics.arcade.isPaused = false;
            diedDecider.call(this);
        }
        deathCounter += 1;
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
                if (game.physics.arcade.isPaused) {
                    gravObj.gravWeight = 0;
                }
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
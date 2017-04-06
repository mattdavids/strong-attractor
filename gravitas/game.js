let Game = function (game, startingLevelNum) {

    let player,
        walls,
        shockers,
        gravObjects,
        checkpoints,
        exits,
        emitters,
        worldParticles,
        backgrounds;

    let playerShadowLeft,
        playerShadowRight,
        playerShadowBottom,
        playerShadowTop;

    let clickedObj;

    let graphics;

    let levelLoader;
    let currentLevelNum;

    let pauseBtn;
    let stopPauseAnimation;
    let notCurrentlyDying;
    let pausedSize;
    let selectableGravObjects;
    let currentHighlightedObjIndex;
    let rightKeyWasPressed,
        leftKeyWasPressed;
    let deathFall;
    let deathCounter;
    let playerHasHitCheckpoint;

    let previous_velocity_y,
        isJumping,
        jumpCount;
    let playerStartX,
        playerStartY;



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

    function unpackObjects(loaderObjects) {
        player = loaderObjects.player;
        walls = loaderObjects.walls;
        shockers = loaderObjects.shockers;
        gravObjects = loaderObjects.gravObjects;
        checkpoints = loaderObjects.checkpoints;
        exits = loaderObjects.exits;
        emitters = loaderObjects.emitters;
        worldParticles = loaderObjects.worldParticles;
        playerStartX = loaderObjects.playerStartX;
        playerStartY = loaderObjects.playerStartY;
        backgrounds = loaderObjects.backgrounds;
    }

    function loadLevel() {
        let levelObjects = levelLoader.loadLevel(currentLevelNum, playerHasHitCheckpoint, playerStartX, playerStartY, checkpoints);
        unpackObjects(levelObjects);
        setupGravityObjects();
    }

    function setupPauseButton() {
        pauseBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        pauseBtn.onDown.add(function() {
            if (notCurrentlyDying) {
                shockers.children.forEach(function(ele) {
                    ele.animations.paused = ! ele.animations.paused;
                });
                game.physics.arcade.isPaused = ! game.physics.arcade.isPaused;

                if (! game.physics.arcade.isPaused) {
                    stopPauseAnimation = true;
                    pausedSize = game.width;
                    game.time.events.resume();
                    selectableGravObjects.length = 0;
                } else {
                    pausedSize = pauseAnimationSpeed;
                    game.time.events.pause();
                    handleGravObjSelection();
        
                }
            }

        }, null);
    }

    function handleGravObjSelection() {
        // Place all objects currently on the screen into a list
        gravObjects.forEach(function(gravObj) {
            if    ((gravObj.x + 10 < game.camera.x + game.width ) && (gravObj.x - 10 > game.camera.x)
                && (gravObj.y + 10 < game.camera.y + game.height) && (gravObj.y - 10 > game.camera.y)) {
                if(!gravObj.flux) {
                    selectableGravObjects.push(gravObj);
                }
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
        for(let i = 0; i < selectableGravObjects.length; i++) {
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
        game.load.image('player', 'assets/art/player.png');
        game.load.image('exit', 'assets/art/exit.png');
        game.load.image('wall', 'assets/art/bricks_gray.png');
        game.load.image('gravObj', 'assets/art/gravObj.png');
        game.load.image('shadow', 'assets/art/shadow.png');
        game.load.image('checkpoint', 'assets/art/flag_red.png');
        game.load.image('checkpointActivated', 'assets/art/flag_green.png');
        game.load.image('groundParticle', 'assets/art/groundParticle.png');
        game.load.image('bg_stone_1', 'assets/art/bg_stone_1.png');
        game.load.image('bg_stone_2', 'assets/art/bg_stone_2.png');
        game.load.image('bg_stone_3', 'assets/art/bg_stone_3.png');
        game.load.image('bg_stone_4', 'assets/art/bg_stone_4.png');


        game.load.audio('death', ['assets/audio/death.mp3', 'assets/audio/death.ogg']);

        game.load.spritesheet('shocker', 'assets/art/electricity_sprites.png', 30, 30, 3);

        levelLoader = new LevelLoader(game);
        levelLoader.setup();
        currentLevelNum = startingLevelNum;
    }

    function create() {
        game.stage.backgroundColor = '#faebd7';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        graphics = game.add.graphics();

        playerHasHitCheckpoint = false;
        
        loadLevel();

        setupPauseButton();
        
        game.input.keyboard.onUpCallback = function (event) {
            if (event.keyCode === Phaser.Keyboard.RIGHT) {
                rightKeyWasPressed = true;
            }
            if (event.keyCode === Phaser.Keyboard.LEFT) {
                leftKeyWasPressed = true;
            }
        };

        //makeLevelSelector();

        playerShadowLeft = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        playerShadowLeft.anchor.set(.5, .5);
        playerShadowLeft.body.setSize(5, 1, 0, 8);

        playerShadowRight = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        playerShadowRight.anchor.set(.5, .5);
        playerShadowRight.body.setSize(15, 1, 0, 8);

        playerShadowBottom = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        playerShadowBottom.anchor.set(.5, .5);
        playerShadowBottom.body.setSize(15, 1, 0, 14);

        playerShadowTop = game.add.sprite(player.body.position.x, player.body.position.y, 'shadow');
        playerShadowTop.anchor.set(.5, .5);
        playerShadowTop.body.setSize(13, 1, 0, 0);
        
        notCurrentlyDying = true;
        deathFall = false;
        
        rightKeyWasPressed = false;
        leftKeyWasPressed = false;
            
        selectableGravObjects = [];
    }

    function update() {
        // Move the player in a parabolic death animation when dead, 
        // Reset the game when the player falls below the game window
        if (deathFall) {
            doDeathFallAnimation();
        }
        updatePlayerCollision();

        // If the player is not dead, play the death animation on contact with shockers
        // Don't allow player to change the gravity while dead
        if (notCurrentlyDying) {
            game.physics.arcade.overlap(player, shockers, deathAnimation, null, null);
        }
        if (! game.physics.arcade.isPaused){
            doPlayerMovement();
            // When the player hits the ground after jumping, play a you hit the ground particle effect
            doHitGroundAnimation();
            checkWallCollision();
            doJumpPhysics();
            doGravityPhysics();

            previous_velocity_y = player.body.velocity.y;

            isJumping = ! player.isTouchingBottom;
            
            rightKeyWasPressed = false;
            leftKeyWasPressed = false;

        } else {
            // If time is frozen, keep the particles in the same state until time is unfrozen
            emitters.forEach(function(emitter) {
                emitter.forEachAlive(function(p) {
                    p.lifespan += millisecondsPerFrame;
                }, null);
            }, null);

            worldParticles.forEachAlive(function(p) {
                p.lifespan += millisecondsPerFrame;
            }, null);

            if (notCurrentlyDying) {
                // Adjust attraction of clicked object
                adjustAttractorsPull();
            }
        }
    }

    function render() {
        let drawGravObjCircle = function(gravObj) {
            // these are heuristic constants which look okay
            let subAmount = 50;
            let radius = (gravObj.gravWeight / gravCoef) * (circleRadius * 2);
            let alpha = 0.1;
            while (radius > 0) {
                graphics.beginFill(gravObjColor, alpha);
                graphics.drawCircle(gravObj.x, gravObj.y, radius);
                graphics.endFill();
                radius -= subAmount;
            }
        };
        
        graphics.clear();
        
        gravObjects.children.forEach(drawGravObjCircle);

        if ((game.physics.arcade.isPaused && notCurrentlyDying) || stopPauseAnimation) {
            graphics.beginFill(0xa3c6ff, .5);
            graphics.drawRect(player.x - pausedSize + player.body.velocity.x/15, player.y - pausedSize + player.body.velocity.y/15, 2 * pausedSize, 2 * pausedSize);
            graphics.endFill();

            if (stopPauseAnimation) {
                if (pausedSize > pauseAnimationSpeed) {
                    pausedSize -= pauseAnimationSpeed;
                } else {
                    stopPauseAnimation = false;
                }
            } else if (pausedSize < game.width) {
                pausedSize += pauseAnimationSpeed;
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
        player.kill();
        walls.destroy();
        shockers.destroy();
        gravObjects.destroy();
        exits.destroy();
        worldParticles.destroy();
        if (!playerHasHitCheckpoint) {
            checkpoints.destroy();
        }
    }

    function updatePlayerCollision() {
        game.physics.arcade.collide(emitters, walls);
        game.physics.arcade.collide(player, walls);
        game.physics.arcade.collide(player, gravObjects);

        game.physics.arcade.overlap(player, checkpoints, onCheckpointHit, null, this);
        game.physics.arcade.overlap(player, exits, onExit, null, null);

        player.isTouchingRight = false;
        player.isTouchingLeft = false;
        player.isTouchingBottom = false;
        player.isTouchingTop = false;

        playerShadowLeft.body.position.set(player.body.position.x - 2, player.body.position.y);
        playerShadowRight.body.position.set(player.body.position.x + .5, player.body.position.y);
        playerShadowBottom.body.position.set(player.body.position.x - 1, player.body.position.y + 15);
        playerShadowTop.body.position.set(player.body.position.x + 1, player.body.position.y - 17);

        game.physics.arcade.overlap(playerShadowRight, walls, function() {
            player.isTouchingRight = true;
        }, null, null);
        game.physics.arcade.overlap(playerShadowLeft, walls, function() {
            player.isTouchingLeft = true;
        }, null, null);
        game.physics.arcade.overlap(playerShadowBottom, walls, function() {
            player.isTouchingBottom = true;
        }, null, null);
        game.physics.arcade.overlap(playerShadowTop, walls, function() {
            player.isTouchingTop = true;
        }, null, null);
    }
    
    function adjustAttractorsPull() {
        if (game.input.activePointer.leftButton.isDown && clickedObj !== null && !clickedObj.flux) {
            clickedObj.gravWeight = Math.min(clickedObj.gravMax, clickedObj.gravWeight + 5000)
        }
        if (game.input.activePointer.rightButton.isDown && clickedObj !== null && !clickedObj.flux) {
            clickedObj.gravWeight = Math.max(clickedObj.gravMin, clickedObj.gravWeight - 5000)
        }
        
        if (rightKeyWasPressed) {
            currentHighlightedObjIndex = (currentHighlightedObjIndex + 1) % selectableGravObjects.length;
            rightKeyWasPressed = false;
        }
        if (leftKeyWasPressed) {
            currentHighlightedObjIndex = (currentHighlightedObjIndex - 1) % selectableGravObjects.length;
            if (currentHighlightedObjIndex === -1) {
                currentHighlightedObjIndex = selectableGravObjects.length - 1;
            }
            leftKeyWasPressed = false;
        }
        if (game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
            let obj = selectableGravObjects[currentHighlightedObjIndex];
            if (obj) {
                obj.gravWeight = Math.min(obj.gravMax, obj.gravWeight + 5000);
            }
        }
        if (game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            let obj = selectableGravObjects[currentHighlightedObjIndex];
            if (obj) {
                obj.gravWeight = Math.max(obj.gravMin, obj.gravWeight - 5000);
            }
        }
    }
    
    function doPlayerMovement(){
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
        if (isJumping && player.isTouchingBottom) {
            // add player.body.velocity.x / 14 so that particles appear where player *will* be next frame
            let emitter = game.add.emitter(player.x + player.body.velocity.x/14, player.bottom + 2);
            let numParticles = Math.max(5, (previous_velocity_y - 220)/40) ;
            
            emitter.makeParticles('groundParticle', 0, numParticles, true);
            emitter.gravity = 300;
            emitter.width = 20;
            emitter.setYSpeed(-100);
            emitter.start(true, 500, null, numParticles);
            game.time.events.add(1000, function() {
                emitter.destroy(true);
            }, null);
            emitters.add(emitter);
            game.world.bringToTop(emitters);
        }

        // Fade out the particles over their lifespan
        emitters.forEach(function(emitter) {
            emitter.forEachAlive(function(p) {
                //p.alpha = p.lifespan / emitter.lifespan;
                p.alpha = 1 - Math.pow(emitter.lifespan - p.lifespan, 2)/Math.pow(emitter.lifespan, 2);
            }, null);
        }, null);
    }
    
    function checkWallCollision() {
        //If just landed on top of a block under another, get out of the wall and keep moving
        if ((player.body.touching.down || player.isTouchingBottom) && isJumping && (player.isTouchingLeft || player.isTouchingRight)) {
            player.body.velocity.x = player.isTouchingLeft * groundAcceleration - player.isTouchingRight * groundAcceleration;
            player.body.velocity.y = previous_velocity_y;
        }

        //If stuck in a wall, get out of the wall and keep moving
        if ((player.body.touching.down || player.isTouchingBottom) && player.isTouchingTop && isJumping) {
            player.body.velocity.x = player.isTouchingLeft * groundAcceleration - player.isTouchingRight * groundAcceleration;
            player.x = player.x + player.isTouchingLeft * ((blockSize/2) - (player.body.left % (blockSize/2))) - player.isTouchingRight * (player.body.right % (blockSize/2));
            if (player.body.velocity.y === 0) {
                player.body.velocity.y = previous_velocity_y;
            }
        }
    }
    
    function doJumpPhysics() {
        if (game.input.keyboard.isDown(Phaser.KeyCode.W) && player.isTouchingBottom && player.body.touching.down && ! player.isTouchingTop && ! isJumping) {
            player.body.velocity.y = -jumpVelocity;
            jumpCount = 0;
            isJumping = true;
        }
        //Let user jump higher if they hold the button down
        if (jumpCount < jumpFrames) {
            if (game.input.keyboard.isDown(Phaser.KeyCode.W)) {
                player.body.velocity.y -= jumpVelocity/(jumpFrames - 3)
            } else {
                jumpCount = jumpFrames;
            }

        }
        
        jumpCount += 1;
    }

    function setupGravityObjects() {
        gravObjects.children.forEach(function(gravObj) {
            gravObj.events.onInputDown.add(startGravityClick);
            gravObj.events.onInputUp.add(function() {
                clickedObj = null;
            }, null);
        });
    }
    
    function doGravityPhysics(){
        
        gravityEffectsOnObject(player);
        emitters.forEach(function(emitter) {
            emitter.forEachAlive(function(p) {
                gravityEffectsOnObject(p);
            }, null);
        }, null);
        worldParticles.forEachAlive(function(p) {
            gravityEffectsOnObject(p);
        }, null);

        // Gravity object changes
        
        gravObjects.forEach(function(gravObj) {
            
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
                let movingToX = movementList[movementIndex].split('#')[0] - blockSize/2;
                let movingToY = movementList[movementIndex].split('#')[1] - blockSize/2;

                if (parseInt(loc.x) === movingToX && parseInt(loc.y) === movingToY) {
                    gravObj.movementIndex = (movementIndex + 1) % movementList.length;
                } else {
                    gravObj.body.velocity.x = (loc.x < movingToX) * blockSize - (loc.x > movingToX) * blockSize;
                    gravObj.body.velocity.y = (loc.y < movingToY) * blockSize - (loc.y > movingToY) * blockSize;
                }
            }
            
        });
    }
    
    function gravityEffectsOnObject(obj) {
        let xGravCoef = 0;
        let yGravCoef = 0;
        
        gravObjects.forEach(function(gravObj) {

            let diff = Phaser.Point.subtract(obj.position, gravObj.position);
            let r = diff.getMagnitude();
            diff.normalize();

            if ( r < (gravObj.gravWeight / gravCoef) * circleRadius) {
                xGravCoef += gravObj.gravWeight * diff.x / r;
                yGravCoef += gravObj.gravWeight * diff.y / r;
            }
        });
        
        if (xGravCoef > 0) {
            obj.body.acceleration.x = -xGravCoef * !obj.isTouchingLeft;
        } else {
            obj.body.acceleration.x = -xGravCoef * !obj.isTouchingRight;
        }

        obj.body.acceleration.y = -yGravCoef;
        
    }

    // Starts the death animation by setting flags. Freezes the player, pauses the game state, shakes the screen, then sets a timer to set the deathFall flag which is run in update
    function deathAnimation() {
        notCurrentlyDying = false;
        game.physics.arcade.isPaused = true;
        player.body.allowGravity = false;
        player.body.velocity = new Phaser.Point(0, 0);
        let deathSound = game.add.audio('death');
        deathSound.volume = 0.3;
        deathSound.play();
        game.time.events.add(0, function() {
            game.camera.shake(.008, deathAnimationTime);
        });
        game.time.events.add(deathAnimationTime + 100, function() {
            deathFall = true;
            deathCounter = 0;
        });
    }
    
    function doDeathFallAnimation() {
        let movement;
        if (Math.abs((Math.pow(deathCounter - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)) > blockSize) {
            movement = blockSize;
        } else {
            movement = (Math.pow(deathCounter - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)
        }
        player.y += movement;
        if (player.y > game.world.height + 3 * blockSize) {
            deathFall = false;
            notCurrentlyDying = true;
            game.physics.arcade.isPaused = false;
            onPlayerDeath();
        }
        deathCounter += 1;
    }

    function onPlayerDeath() {
        clearLevel();
        loadLevel();
    }

    function onExit() {
        playerHasHitCheckpoint = false;
        clearLevel();
        if (currentLevelNum + 1 === levelLoader.getLevelCount()) {
            game.state.start('win');
        } else {
            currentLevelNum++;
            loadLevel();
        }
    }
    
    function onCheckpointHit(player, checkpoint) {
        if (! checkpoint.hasBeenHitBefore) {
            checkpoint.hasBeenHitBefore = true;
            playerHasHitCheckpoint = true;
            playerStartX = checkpoint.x;
            playerStartY = checkpoint.y;
            checkpoint.loadTexture('checkpointActivated');
        }
    }

    function startGravityClick(gravObj) {
        if (game.input.activePointer.rightButton.isDown) {
            if (! gravObj.secondClick) {
                gravObj.secondClick = true;
                game.time.events.add(300, function() {
                    gravObj.secondClick = false;
                }, null);

            } else {
                if (game.physics.arcade.isPaused) {
                    gravObj.gravWeight = 0;
                }
            }
        }

        clickedObj = gravObj;
    }

    return {
        preload: preload,
        create: create,
        update: update,
        render: render
    };
};
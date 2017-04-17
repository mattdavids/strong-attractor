let Game = function (game, currentLevelNum) {

    // Displayables from level file
    let player,
        walls,
        shockers,
        gravObjects,
        checkpoints,
        exits,
        emitters,
        backgrounds;

    // Player collision shadows
    let playerShadowLeft,
        playerShadowRight,
        playerShadowBottom,
        playerShadowTop;

    let clickedObj;
    let arrow;

    // Dynamic displayables
    let gravObjGraphics;
    let gravObjTopGraphics;
    let pauseGraphics;
    let selectedObjGraphics;

    let levelLoader;
    //let currentLevelNum;

    let pauseBtn;
    let stopPauseAnimation;
    let pauseAnimationTick;
    let notCurrentlyDying;
    let selectableGravObjects;
    let currentHighlightedObjIndex;
    let rightKeyWasPressed,
        leftKeyWasPressed;
    let deathFall;
    let deathCounter;
    let playerHasHitCheckpoint;

    // Player movement
    let previous_velocity_y,
        isJumping,
        jumpCount,
        lastTwoJumpFrames;
    // Player start position
    let playerStartX,
        playerStartY;

    //Debug
    let skipPressed;

    // Constants


    const jumpFrames = 10;

    // Physics
    const frictionCoef = 0.5;
    const groundAcceleration = 30;
    const airAcceleration = 5;
    const maxHorizontalVelocity = 250;
    const jumpVelocity = 300;
    const millisecondsPerFrame = 100/6;
    const movingObjSpeed = 30;

    // Display
    const blockSize = 30;
    const selectedObjWidth = 8;
    const arrowDist = 8;

    const pauseAnimationSpeed = 50;
    const deathFallSpeed = 6;
    const deathAnimationTime = 300;
    const pauseMaxTick = 30;

    function unpackObjects(loaderObjects) {
        player = loaderObjects.player;
        walls = loaderObjects.walls;
        shockers = loaderObjects.shockers;
        gravObjects = loaderObjects.gravObjects;
        checkpoints = loaderObjects.checkpoints;
        exits = loaderObjects.exits;
        emitters = loaderObjects.emitters;
        playerStartX = loaderObjects.playerStartX;
        playerStartY = loaderObjects.playerStartY;
        backgrounds = loaderObjects.backgrounds;
    }

    function loadLevel() {
        let levelObjects = levelLoader.loadLevel(currentLevelNum, playerHasHitCheckpoint, playerStartX, playerStartY, checkpoints);
        if(checkpoints) {
            checkpoints.destroy();
        }
        unpackObjects(levelObjects);
        setupGravityObjects();

        game.world.bringToTop(emitters);
        game.world.sendToBack(gravObjGraphics);
        game.world.sendToBack(backgrounds);
        game.world.bringToTop(gravObjTopGraphics);
        game.world.bringToTop(pauseGraphics);
        game.world.bringToTop(selectedObjGraphics);

        arrow = game.add.sprite(player.x, player.y, 'arrow');
        arrow.anchor.set(.5, .5);
        arrow.visible = false;
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
                    game.time.events.resume();
                    selectableGravObjects.length = 0;
                    arrow.visible = false;
                    pauseAnimationTick = pauseMaxTick;
                } else {
                    game.time.events.pause();
                    handleGravObjSelection();
                    
                    arrow.visible = true;
                    pauseAnimationTick = 0;
        
                }
            }

        }, null);
    }

    function handleGravObjSelection() {
        // Place all objects currently on the screen into a list
        gravObjects.forEach(function(gravObj) {
            if    ((gravObj.x + 10 < game.camera.x + game.width ) && (gravObj.x - 10 > game.camera.x)
                && (gravObj.y + 10 < game.camera.y + game.height) && (gravObj.y - 10 > game.camera.y)) {
                if(!gravObj.flux && !gravObj.moving) {
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
        game.load.image('arrow', 'assets/art/arrow.png');
        game.load.image('groundParticle', 'assets/art/groundParticle.png');
        game.load.image('gravParticle', 'assets/art/gravParticle.png');
        game.load.image('bg_stone_1', 'assets/art/bg_stone_1.png');
        game.load.image('bg_stone_2', 'assets/art/bg_stone_2.png');
        game.load.image('bg_stone_3', 'assets/art/bg_stone_3.png');
        game.load.image('bg_stone_4', 'assets/art/bg_stone_4.png');
        game.load.image('bg_large_stone_1', 'assets/art/bg_large_stone_1.png');


        game.load.audio('death', ['assets/audio/death.mp3', 'assets/audio/death.ogg']);

        game.load.spritesheet('shocker', 'assets/art/electricity_sprites.png', 30, 30, 3);

        levelLoader = new LevelLoader(game);
        levelLoader.setup();
    }

    function create() {
        console.log("Starting Game state at L"+currentLevelNum);
        game.stage.backgroundColor = '#faebd7';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        gravObjGraphics = game.add.graphics();
        gravObjTopGraphics = game.add.graphics();
        pauseGraphics = game.add.graphics();
        selectedObjGraphics = game.add.graphics();

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
        
        lastTwoJumpFrames = [false, false];

        skipPressed = false;
    }

    function update() {
        // Move the player in a parabolic death animation when dead,
        // Reset the game when the player falls below the game window
        if (deathFall) {
            doDeathFallAnimation();
        }

        doDebugButtons();

        doCollision();
        doGravityPhysics();

        // If the player is not dead, play the death animation on contact with shockers
        // Don't allow player to change the gravity while dead
        if (notCurrentlyDying) {
            game.physics.arcade.overlap(player, shockers, deathAnimation, null, null);
        }
        if (! game.physics.arcade.isPaused){
            doPlayerMovement();
            doWallMovement();
            // When the player hits the ground after jumping, play a you hit the ground particle effect
            doHitGroundAnimation();
            checkWallCollision();
            doJumpPhysics();
            gravObjects.forEach(function(gravObj) {
                gravObj.animateParticles();
            }, null);

            previous_velocity_y = player.body.velocity.y;
            
            lastTwoJumpFrames = [lastTwoJumpFrames[1], isJumping];

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

            if (notCurrentlyDying) {
                // Adjust attraction of clicked object
                adjustAttractorsPull();
            }
            
            doArrowChange();
        
        }
    }

    function render() {
        let drawGravObjCircle = function(graphicsObj, gravObj, alpha) {
            // these are heuristic constants which look okay
            const subAmount = 50;
            let diameter = 2 * gravObj.radius;
            while (diameter > 0) {
                graphicsObj.beginFill(0x351777, alpha);
                graphicsObj.drawCircle(gravObj.x, gravObj.y, diameter);
                graphicsObj.endFill();
                diameter -= subAmount;
            }
        };

        gravObjGraphics.clear();
        gravObjTopGraphics.clear();
        pauseGraphics.clear();
        selectedObjGraphics.clear();
        
        // TODO: this is super processor intensive
        gravObjects.children.forEach(function(gravObj) {
            drawGravObjCircle(gravObjGraphics, gravObj, .04);
            drawGravObjCircle(gravObjTopGraphics, gravObj, .04);
        });

        if ((game.physics.arcade.isPaused && notCurrentlyDying) || stopPauseAnimation) {
            let pausedSize = game.width * quadraticEase(pauseAnimationTick, pauseMaxTick);
            
            pauseGraphics.beginFill(0xa3c6ff, .5);
            pauseGraphics.drawRect(player.x - pausedSize, player.y - pausedSize, 2 * pausedSize, 2 * pausedSize);
            pauseGraphics.endFill();

            if (stopPauseAnimation) {
                if (pauseAnimationTick > 0) {
                    pauseAnimationTick -= 1.5;
                } else {
                    stopPauseAnimation = false;
                }
            } else if (pauseAnimationTick < pauseMaxTick) {
                pauseAnimationTick += 1;
            }
            
        }

        if (selectableGravObjects.length > 0) {

            let selectedObj = selectableGravObjects[currentHighlightedObjIndex];
            selectedObjGraphics.beginFill(0xffffff, 1);
            
            selectedObjGraphics.drawRect(selectedObj.x - 15, selectedObj.y - 15, selectedObjWidth, 30);
            selectedObjGraphics.drawRect(selectedObj.x - 15, selectedObj.y - 15, 30, selectedObjWidth);
            selectedObjGraphics.drawRect(selectedObj.x - 15, selectedObj.y + 15 - selectedObjWidth, 30, selectedObjWidth);
            selectedObjGraphics.drawRect(selectedObj.x + 15 - selectedObjWidth, selectedObj.y - 15, selectedObjWidth, 30);
            
            selectedObjGraphics.endFill();
        }
    }

    function clearLevel() {
        player.kill();
        walls.destroy();
        shockers.destroy();
        gravObjects.forEach(function(gravObj) {
            if (gravObj.gravParticles !== undefined) {
                gravObj.gravParticles.destroy();
            }
        }, null);
        gravObjects.destroy();
        exits.destroy();
        backgrounds.destroy();
        arrow.kill();
        if (!playerHasHitCheckpoint) {
            checkpoints.destroy();
        }
    }

    function doCollision() {
        game.physics.arcade.collide(emitters, walls);
        game.physics.arcade.collide(player, walls);
        game.physics.arcade.collide(player, gravObjects);

        game.physics.arcade.overlap(player, checkpoints, onCheckpointHit, null, null);
        game.physics.arcade.overlap(player, exits, onExit, null, null);

        gravObjects.forEach(function(gravObj) {
            game.physics.arcade.collide(gravObjects, gravObj.gravParticles, function(_, p) {
                    p.life = 0;
            }, null, null);
        }, null);

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
            if (player.body.touching.down && !checkLastTwoJumpFrames()) {
                player.body.velocity.x = Math.max(-maxHorizontalVelocity, player.body.velocity.x - groundAcceleration);
            } else {
                player.body.velocity.x -= airAcceleration;
            }
        } else if (game.input.keyboard.isDown(Phaser.KeyCode.D)) {
            if (player.body.touching.down && !checkLastTwoJumpFrames()) {
                player.body.velocity.x = Math.min(maxHorizontalVelocity, player.body.velocity.x + groundAcceleration);
            } else {
                player.body.velocity.x += airAcceleration;
            }
        } else {
            if (player.body.touching.down && !isJumping) {
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

    function doWallMovement() {
        walls.forEach(function(wall) {
            if (wall.moving) {
                moveObjInPattern(wall);
            }
        });
    }
    
    function doDebugButtons() {
        // Button to skip levels
        if(game.input.keyboard.isDown(Phaser.KeyCode.NUMPAD_MULTIPLY)) {
            if(!skipPressed) {
                onExit();
            }
            skipPressed = true;
        } else{
            skipPressed = false;
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
        }

        // Fade out the particles over their lifespan
        emitters.forEach(function(emitter) {
            emitter.forEachAlive(function(p) {
                //p.alpha = p.lifespan / emitter.lifespan;
                p.alpha = quadraticEase(p.lifespan, emitter.lifespan);
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

        // Gravity object changes

        gravObjects.forEach(function(gravObj) {
            gravObj.gravParticles.forEachAlive(function(p) {
                gravityEffectsOnObject(p);
            }, null);

            if (gravObj.flux) {
                gravObj.gravWeight += 2000 * gravObj.fluxConst;
                if (gravObj.gravWeight >= gravObj.gravMax || gravObj.gravWeight <= gravObj.gravMin) {
                    gravObj.fluxConst *= -1;
                }
            }

            if (gravObj.moving) {
                moveObjInPattern(gravObj);
            }

        });
    }

    function moveObjInPattern(obj) {
        let loc = obj.body.position;
        let movementList = obj.movementList;
        let movementIndex = obj.movementIndex;
        let movingToX = movementList[movementIndex].split('#')[0] - blockSize/2;
        let movingToY = movementList[movementIndex].split('#')[1] - blockSize/2;

        if (parseInt(loc.x) === movingToX && parseInt(loc.y) === movingToY) {
            obj.movementIndex = (movementIndex + 1) % movementList.length;
        } else {
            obj.body.velocity.x = (loc.x < movingToX) * movingObjSpeed - 
                                  (loc.x > movingToX) * movingObjSpeed;
            obj.body.velocity.y = (loc.y < movingToY) * movingObjSpeed - 
                                  (loc.y > movingToY) * movingObjSpeed;
        }
    }
    
    function gravityEffectsOnObject(obj) {
        let xGravCoef = 0;
        let yGravCoef = 0;

        gravObjects.forEach(function(gravObj) {

            let diff = Phaser.Point.subtract(obj.position, gravObj.position);
            let r = diff.getMagnitude();
            diff.normalize();

            if ( r < gravObj.radius) {
                xGravCoef += gravObj.gravWeight * diff.x / r;
                yGravCoef += gravObj.gravWeight * diff.y / r;
            }
        });

        if (obj.gravConstant !== undefined) {
            xGravCoef *= obj.gravConstant;
            yGravCoef *= obj.gravConstant;
        }

        if (xGravCoef > 0) {
            obj.body.acceleration.x = -xGravCoef * !obj.isTouchingLeft;
        } else {
            obj.body.acceleration.x = -xGravCoef * !obj.isTouchingRight;
        }

        obj.body.acceleration.y = -yGravCoef;

    }
    
    function doArrowChange() {
        let xDelta = player.body.velocity.x + player.body.acceleration.x/14;
        let yDelta = player.body.velocity.y + (player.body.acceleration.y + player.body.gravity.y)/14;

        let theta = Math.atan2(yDelta, xDelta);

        arrow.x = player.x + xDelta/14 + arrowDist * Math.cos(theta);
        arrow.y = player.y + yDelta/14 + arrowDist * Math.sin(theta);

        arrow.rotation = theta;
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
        }, null);
        game.time.events.add(deathAnimationTime + 100, function() {
            deathFall = true;
            deathCounter = 0;
        }, null);
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
    
    function checkLastTwoJumpFrames() {
        return (lastTwoJumpFrames[0] || lastTwoJumpFrames[1]);
    }
    
    function quadraticEase(t, tmax) {
        return 1 - Math.pow(tmax - t, 2)/Math.pow(tmax, 2);
    }

    function setLevel(lnum){
        currentLevelNum = lnum;
    }

    return {
        preload: preload,
        create: create,
        update: update,
        render: render,
        setLevel: setLevel
    };
};
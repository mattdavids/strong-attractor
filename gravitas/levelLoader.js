let LevelLoader = function (game) {
    const playerSize = 14;
    let levels;

    function setup() {
        let levelList = game.cache.getText('levelList').split('\n');
        let levelNames = [];
        for(let i=0; i< levelList.length; i++){
            levelNames[i]="assets/levels/"+levelList[i];
            game.load.text("level"+i, levelNames[i]);
        }

        levels = [];
        game.load.onLoadComplete.add(function() {
            for(let i = 0; i < levelList.length; i++){
                levels[i] = game.cache.getText("level"+i).split('\n');
            }
        }, null);
    }

    function getLevelCount() {
        return levels.length;
    }

    function makePlayer(x, y, playerGrav) {
        let player = game.add.sprite(x, y, 'player');
        player.anchor.set(.5, .5);
        player.body.setSize(playerSize, playerSize, 1, 1);
        player.body.gravity.y = playerGrav;
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER, 0.2);
        return player;
    }

    function loadObject(levelObjects, objectName, objectX, objectY, playerGrav, objectInfo, playerHasHitCheckpoint, playerStartX, playerStartY, checkpoints){
        let gravObj;
        let movementList;
        let wall;
        switch(objectName) {
            case 'wall':
                wall = game.add.sprite(objectX, objectY, objectName);
                wall.moving = false;
                wall.body.immovable = true;
                wall.anchor.set(.5,.5);
                levelObjects.walls.add(wall);
                break;
            case 'wall_move':
                wall = game.add.sprite(objectX, objectY, 'wall');
                movementList = objectInfo[3].split('-');
                wall.moving = true;
                wall.movementList = movementList;
                wall.movementIndex = 0;
                wall.body.immovable = true;
                wall.anchor.set(.5, .5);
                levelObjects.walls.add(wall);
                break;
            case 'gravObj_off':
                // x Location, y location, gravMin, gravMax, on?, flux?, moving?
                gravObj = GravObjMaker(game, objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                    false, false, false);
                levelObjects.gravObjects.add(gravObj);
                break;
            case 'gravObj_on':
                gravObj = GravObjMaker(game, objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                    true, false, false);
                levelObjects.gravObjects.add(gravObj);
                break;
            case 'gravObj_flux':
                gravObj = GravObjMaker(game, objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                    true, true, false);
                levelObjects.gravObjects.add(gravObj);
                break;
            case 'gravObj_move':
                //list in format x1#y1-x2#y2-x3#y3...
                movementList = objectInfo[5].split('-');
                gravObj = GravObjMaker(game, objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                    true, false, true, movementList);
                levelObjects.gravObjects.add(gravObj);
                break;
            case 'gravObj_moveFlux':
                movementList = objectInfo[5].split('-');
                gravObj = GravObjMaker(game, objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                    true, true, true, movementList);
                levelObjects.gravObjects.add(gravObj);
                break;
            case 'shocker':
                let shocker = game.add.sprite(objectX, objectY, objectName);
                shocker.anchor.set(.5, .5);
                shocker.animations.add('crackle');
                shocker.animations.play('crackle', 10, true);
                levelObjects.shockers.add(shocker);
                break;
            case 'checkpoint':
                if(!playerHasHitCheckpoint) {
                    let checkpoint = game.add.sprite(objectX, objectY, objectName);
                    checkpoint.anchor.set(.5, .5);
                    //checkpoint.body.immovable = true;
                    checkpoint.hasBeenHitBefore = false;
                    levelObjects.checkpoints.add(checkpoint);
                } else {
                    let obj;
                    checkpoints.forEach(function(checkpoint) {
                        if (checkpoint.x == objectX && checkpoint.y == objectY) {
                            if (checkpoint.hasBeenHitBefore) {
                                obj = game.add.sprite(objectX, objectY, 'checkpointActivated');
                                obj.hasBeenHitBefore = true;
                            } else {
                                obj = game.add.sprite(objectX, objectY, objectName);
                                obj.hasBeenHitBefore = false;
                            }
                            obj.anchor.set(.5, .5);
                            levelObjects.checkpoints.add(obj);
                        }
                    });
                }
                break;
            case 'exit':
                let exit = game.add.sprite(objectX, objectY, objectName);
                exit.anchor.set(.5, .5);
                exit.body.immovable = true;
                levelObjects.exits.add(exit);
                break;
            case 'player':
                if (!playerHasHitCheckpoint) {
                    levelObjects.player = makePlayer(objectX, objectY, playerGrav);
                } else {
                    levelObjects.player = makePlayer(playerStartX, playerStartY, playerGrav);
                }
                break;
            default:
                break;
        }

        return levelObjects;
    }

    function initializeLevelObjects(playerHasHitCheckpoint, checkpoints){
        let levelObjects = {};
        levelObjects.player = makePlayer(0,0,0);
        levelObjects.backgrounds = game.add.group();
        levelObjects.walls = game.add.group();
        levelObjects.gravObjects = game.add.group();
        levelObjects.shockers = game.add.group();
        levelObjects.exits = game.add.group();
        levelObjects.emitters = game.add.group();
        levelObjects.checkpoints = game.add.group();
        
        return levelObjects;
    }

    function buildBackground(levelObjects, width, height, levelNumber, spriteNumMax = 4, spritePrefix = "bg_stone_", blockSize = 30){
        let xMax = parseInt(width) + blockSize;
        let yMax = parseInt(height) + blockSize;
        for(let x=0; x<xMax; x+=blockSize){
            for(let y=0; y<yMax; y+=blockSize){
                let xraw = (x/blockSize)+1;
                let yraw = (y/blockSize)+1;
                let tileType = ((xraw+levelNumber) * (yraw - 2)) + (xraw * (5 + yraw));
                tileType = tileType%27 + 1;
                if(tileType > spriteNumMax)
                    tileType = 1;
                let newBG = game.add.sprite(x, y, spritePrefix+tileType);
                newBG.anchor.set(.5, .5);
                newBG.body.immovable = true;
                levelObjects.backgrounds.add(newBG);
            }
        }
        console.log("Generated "+levelObjects.backgrounds.countLiving() + " bg tiles");
        return levelObjects;
    }

    function loadLevel(levelNumber, playerHasHitCheckpoint, playerStartX, playerStartY, checkpoints) {
        let level = levels[levelNumber];
        let levelObjects = initializeLevelObjects(playerHasHitCheckpoint, checkpoints);

        // Get bounds
        let bounds = level[0].split(',');
        game.world.setBounds(0,0,parseInt(bounds[0]), parseInt(bounds[1]));

        // Get player gravity
        let playerGrav = parseInt(level[1]);

        // Load background
        levelObjects = buildBackground(levelObjects, bounds[0], bounds[1], levelNumber, 1, "bg_large_stone_", 90);

        // Load level objects
        for (let i = 2; i < level.length; i++) {
            let element = level[i];
            let objectInfo = element.split(',');
            let objectName = objectInfo[0];
            let objectX = parseFloat(objectInfo[1]);
            let objectY = parseFloat(objectInfo[2]);

            levelObjects = loadObject(levelObjects, objectName, objectX, objectY, playerGrav, objectInfo, playerHasHitCheckpoint, playerStartX, playerStartY, checkpoints);

        }

        console.log("Loaded "+level.length + " level objects");
        
        // Add player start location
        levelObjects.playerStartX = playerStartX;
        levelObjects.playerStartY = playerStartY;

        return levelObjects;
    }

    return {
        setup: setup,
        getLevelCount: getLevelCount,
        loadLevel: loadLevel
    }
};
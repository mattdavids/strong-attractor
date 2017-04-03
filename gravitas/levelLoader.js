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

    function makeGravObject(x, y, gravMin, gravMax, gravOn, flux, moving, movementList) {
        let gravObj = game.add.sprite(x, y, 'gravObj');
        gravObj.anchor.set(.5, .5);
        gravObj.gravWeight = ((gravMin + gravMax)/2) * gravOn * (1 - flux);
        gravObj.gravMin = gravMin;
        gravObj.gravMax = gravMax;
        gravObj.body.immovable = true;
        gravObj.inputEnabled = true;
        gravObj.flux = flux;
        gravObj.moving = moving;
        gravObj.movementList = movementList;
        gravObj.movementIndex = 0;
        if(flux) {
            gravObj.fluxConst = 1;
        }

        return gravObj;
    }

    function loadLevel(levelNumber) {
        let player;
        let walls = game.add.group();
        let gravObjects = game.add.group();
        let shockers = game.add.group();
        let exits = game.add.group();
        let emitters = game.add.group();

        let level = levels[levelNumber];

        let bounds = level[0].split(',');
        game.world.setBounds(0,0,parseInt(bounds[0]), parseInt(bounds[1]));
        let playerGrav = parseInt(level[1]);
        for (let i = 2; i < level.length; i++) {
            let element = level[i];
            let objectInfo = element.split(',');
            let objectName = objectInfo[0];
            let objectX = parseFloat(objectInfo[1]);
            let objectY = parseFloat(objectInfo[2]);

            let gravObj;

            switch(objectName) {
                case 'wall':
                    let wall = game.add.sprite(objectX, objectY, objectName);
                    wall.body.immovable = true;
                    wall.anchor.set(.5,.5);
                    walls.add(wall);
                    break;
                case 'gravObj_off':
                    // x Location, y location, gravMin, gravMax, on?, flux?, moving?
                    gravObj = makeGravObject(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                        false, false, false);
                    gravObjects.add(gravObj);
                    break;
                case 'gravObj_on':
                    gravObj = makeGravObject(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                        true, false, false);
                    gravObjects.add(gravObj);
                    break;
                case 'gravObj_flux':
                    gravObj = makeGravObject(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                        true, true, false);
                    gravObjects.add(gravObj);
                    break;
                case 'gravObj_move':
                    //list in format x1#y1-x2#y2-x3#y3...
                    let movementList = objectInfo[5].split('-');
                    gravObj = makeGravObject(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]),
                        true, false, true, movementList);
                    gravObjects.add(gravObj);
                    break;
                case 'shocker':
                    let shocker = game.add.sprite(objectX, objectY, objectName);
                    shocker.anchor.set(.5, .5);
                    shocker.animations.add('crackle');
                    shocker.animations.play('crackle', 10, true);
                    shockers.add(shocker);
                    break;
                case 'exit':
                    let exit = game.add.sprite(objectX, objectY, objectName);
                    exit.anchor.set(.5, .5);
                    exit.body.immovable = true;
                    exits.add(exit);
                    break;
                case 'player':
                    player = makePlayer(objectX, objectY, playerGrav);
                    break;
                default:
                    break;
            }
        }
        return {
            player: player,
            walls: walls,
            shockers: shockers,
            gravObjects: gravObjects,
            exits: exits,
            emitters: emitters
        }
    }

    return {
        setup: setup,
        getLevelCount: getLevelCount,
        loadLevel: loadLevel
    }
};
function loadLevel() {
    clearLevel();

    let level = levels[currentLevelNum];
    if (level == undefined) {
        level = ['', '810,420','gravObj_flux,405,210, 0, 300000','wall,795,405','wall,765,405','wall,735,405','wall,735,375','wall,735,345', 'wall,765,345','wall,795,345', 'wall,795,375','exit,705,390', 'player,765,375'];
        console.log("Attempted to load undefined level");
    }


    let bounds = level[0].split(',');
    game.world.setBounds(0,0,parseInt(bounds[0]), parseInt(bounds[1]));
    for (let i = 1; i < level.length; i++) {
        let element = level[i];
        let objectInfo = element.split(',');
        let objectName = objectInfo[0];
        let objectX = parseFloat(objectInfo[1]);
        let objectY = parseFloat(objectInfo[2]);

        switch(objectName) {
            case 'wall':
                let wall = game.add.sprite(objectX, objectY, objectName);
                walls.add(wall);
                wall.body.immovable = true;
                wall.anchor.set(.5,.5);
                break;
            case 'gravObj_off':
                // x Location, y location, gravMin, gravMax, on?, flux?, moving?
                initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), false, false, false);
                break;
            case 'gravObj_on':
                initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, false, false);
                break;
            case 'gravObj_flux':
                initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, true, false);
                break;
            case 'gravObj_move':
                //list in format x1#y1-x2#y2-x3#y3...
                let movementList = objectInfo[5].split('-');
                initializeGravObj(objectX, objectY, parseFloat(objectInfo[3]), parseFloat(objectInfo[4]), true, false, true, movementList);
                break;
            case 'shocker':
                let shocker = game.add.sprite(objectX, objectY, objectName);
                shocker.anchor.set(.5, .5);
                shockers.add(shocker);
                shocker.animations.add('crackle');
                shocker.animations.play('crackle', 10, true);
                break;
            case 'exit':
                let exit = game.add.sprite(objectX, objectY, objectName);
                exit.anchor.set(.5, .5);
                exits.add(exit);
                exit.body.immovable = true;
                break;
            case 'player':
                player_startX = objectX;
                player_startY = objectY;
                break;
            default:
                break;
        }
    }

    player = game.add.sprite(player_startX, player_startY, 'player');
    player.anchor.set(.5, .5);
    player.body.gravity.y = gravCoef / 60;
    game.camera.follow(player);
}

function queueLevelsFromList(){
    let levelList = game.cache.getText('levelList').split('\n');
    levelCount = levelList.length;
    levelNames = [levelCount];
    levels = [levelCount];
    for(let i=0; i<levelCount; i++){
        levelNames[i]="assets/levels/"+levelList[i];
        game.load.text("level"+i, levelNames[i]);
    }
}

function clearLevel(){
    walls.removeAll(true);
    shockers.removeAll(true);
    gravObjects.removeAll(true);
    exits.removeAll(true);

    // player is undefined on first run
    if (player != undefined)
        player.kill();
    // exit is undefined on first run
    if (exit != undefined)
        exit.kill();
}

function selectLevel(){
    // This can be simpler with jquery
    let levelSelector = document.getElementById("level-select");
    currentLevelNum = levelSelector.options[levelSelector.selectedIndex].value;
    loadLevel();
}

let LevelSelect = function (game, gameState) {
    
    let levelSelectBackground,
        startX, // used to save start touch position
        startY, // used to save start touch position
        scrollSpeed = 1,
        elementGroup,
        selectedLevel,
        playerDataList,
        levelCount;

    let xPos,
        yPos,
        heightSpacing = 100;

    function loadLevelSelect() {
        let levelList = game.cache.getText('levelList').split('\n');
        levelCount = levelList.length;

        game.load.image('levelSelectBackground', 'assets/art/levelSelectImages/LevelSelectBackground.png');
        game.load.image('lockedLevel', 'assets/art/levelSelectImages/lockedLevel.png');
        game.load.image('unlockedLevel', 'assets/art/levelSelectImages/unlockedLevel.png');
    }

    function createLevelSelect() {
        updateFromLocalStorage();
        renderLevelSelect();
    }

    function updateFromLocalStorage() {
        playerDataList = localStorage.getItem('user_progress');
        if (playerDataList == null) {
            playerDataList = [0];
            for (let i = 1; i < levelCount; i++) {
                playerDataList[i] = 1;
            }
            localStorage.setItem('user_progress', playerDataList);
        } else {
            playerDataList = playerDataList.split(',');
        }
    }

    function renderLevelSelect() {
        elementGroup = game.add.group();
        let background = game.add.image(game.width/2, 0, 'levelSelectBackground');
        background.anchor.set(0.5, 0.5);
        background.immovable = true;
        elementGroup.add(background);

        addLevelsToTower();
    }

    function addLevelsToTower() {

        for (let levelNum = 0; levelNum < levelCount; levelCount++) {
            let button;

            getLevelPosition(level)

            if (playerDataList[levelNum] == 0) {
                // level is unlocked
                button = game.add.button(xPos, yPos, 'unlockedLevel', function() {
                    clearLevel();
                    gameState.setLevel(button.levelNum);
                    game.state.start('game');
                })
            } else {
                // level is locked
                button = game.add.button(xPos, yPos, 'lockedLevel', function() {
                    alert("This level is locked! :o)");
                })
            }
            button.levelNum = levelNum;
            elementGroup.add(button);
        }
    }

    function getLevelPosition(levelNum) {

        // finding y-axis position
        if (levelNum === 0) yPos = heightSpacing;
        else yPos = heightSpacing * levelNum;

        // finding x-axis position
        if (i === 0 || i % 2 === 0) xPos = 200;
        else xPos = 300;
    }

    function clearLevel() {
        background.kill();
        elementGroup.destroy(); // I think
    }

    function mouseOnMap() {
        // save beginning touching position
        startX = game.input.worldX;
        startY = game.input.worldY;
        elementGroup.saveX = elementGroup.x;
        elementGroup.saveY = elementGroup.y;
    }

    function dragMap() {

    }

    function stopMap() {

    }

    return {
        preload: loadLevelSelect,
        create: createLevelSelect
    };

};
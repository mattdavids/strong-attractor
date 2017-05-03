let LevelSelect = function (game, gameState) {
    
    let levelSelectBackground,
        startX, // used to save start touch position
        startY, // used to save start touch position
        scrollSpeed = 1,
        elementGroup,
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
        levelSelectBackground = game.add.image(game.width/2, 0, 'levelSelectBackground');
        levelSelectBackground.anchor.set(0.5, 0.5);
        elementGroup.add(levelSelectBackground);

        addLevelsToTower();

        elementGroup.x = (game.width - levelSelectBackground.width) / 2;
        elementGroup.y = (game.height - levelSelectBackground.height) / 2;
        game.input.onDown.add(mouseOnScreen, this);
    }

    function addLevelsToTower() {

        for (let levelNum = 0; levelNum < levelCount; levelCount++) {
            let button;

            getLevelPosition(levelNum);

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
            button.xPos = xPos;
            button.yPos = yPos;
            elementGroup.add(button);
        }
    }

    function getLevelPosition(levelNum) {

        // finding y-axis position
        if (levelNum == 0) yPos = heightSpacing;
        else yPos = heightSpacing * levelNum;

        // finding x-axis position
        if (levelNum == 0 || levelNum % 2 == 0) xPos = 400;
        else xPos = 500;
    }

    function clearLevel() {
        elementGroup.destroy(); // I think that's it
    }

    function mouseOnScreen() {
        // save beginning touching position
        startX = game.input.worldX;
        startY = game.input.worldY;
        elementGroup.saveX = elementGroup.x;
        elementGroup.saveY = elementGroup.y;

        game.input.onDown.remove(mouseOnScreen);
        game.input.onUp.add(userStopsTouchingScreen);
        game.input.addMoveCallback(dragScreen, this);
    }

    function dragScreen() {
        let currentX = game.input.worldX,
            currentY = game.input.worldY,
            deltaX = startX - currentX,
            deltaY = startY - currentY;
        elementGroup.x = elementGroup.saveX - deltaX * scrollSpeed;
        elementGroup.y = elementGroup.saveY - deltaY * scrollSpeed;

        // to always have the background fully cover the screen
        if (elementGroup.x < - elementGroup.width + game.width) {
            elementGroup.x = - elementGroup.width + game.width;
        }
        if (elementGroup.x > 0) {
            elementGroup.x = 0;
        }
        if(elementGroup.y < - levelSelectBackground.height + game.height){
            elementGroup.y = - levelSelectBackground.height + game.height;
        }
        if(elementGroup.y > 0){
            elementGroup.y = 0;
        }
    }

    function userStopsTouchingScreen() {
        game.input.onDown.add(mouseOnScreen);
        game.input.onUp.remove(userStopsTouchingScreen);
    }

    return {
        preload: loadLevelSelect,
        create: createLevelSelect
    };

};
let LevelSelect = function (game, gameState) {
    
    let levelSelectBackground,
        startX, // used to save start touch position
        startY, // used to save start touch position
        scrollSpeed = 1,
        levelGroup,
        selectedLevel,
        playerDataList,
        levelCount;

    function loadLevelSelect() {
        let levelList = game.cache.getText('levelList').split('\n');
        levelCount = levelList.length;

        game.load.image('levelSelectBackground', 'assets/art/levelSelectImages/LevelSelectBackground.png');
        game.load.image('level', 'assets/art/levelSelectImages/levelThumbnail');
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
        background = game.add.image(game.width/2, game.height/2, 'levelSelectBackground');
        background.anchor.set(0.5, 0.5);
        background.immovable = true;

        levelGroup = game.add.group();
        addLevelsToTower();
    }

    function addLevelsToTower() {
        let associatedLevel = 0;
        for (let i = 0; i < levelCount; i++) {

        }
    }

    function clearLevel() {
        background.kill();
        levelGroup.destroy();
    }
    
    return {
        preload: loadLevelSelect,
        create: createLevelSelect
    };
    
};
let LevelSelect = function (game, fromMain) {
    
    let thumbCols = 2,
        thumbRows = 6,
        thumbWidth = 96,
        thumbHeight = 96,
        thumbSpacing = 10,
        levelWidth = thumbWidth * thumbRows + thumbSpacing * (thumbRows - 1),
        levelHeight = thumbHeight * thumbCols + thumbSpacing * (thumbCols - 1),
        playerDataList = [];
 
    function loadLevelSelect() {
        game.load.image('lockedThumbnail', 'assets/art/locked.png', thumbHeight, thumbWidth);
        game.load.image('unlockedThumbnail', 'assets/art/unlocked.png', thumbHeight, thumbWidth);
        game.load.image('levelSelectBackground', 'assets/art/LevelSelectBackground.png');
    } 
    
    function updateFromLocalStorage() {
        let levelList = game.cache.getText('levelList').split('\n');
        playerDataList = localStorage.getItem('user_progress');
        if (playerDataList == null) {
            playerDataList = [0];
            for (let i = 1; i < levelList.length; i++) {
                playerDataList[i] = 1;
            }
            localStorage.setItem('user_progress', playerDataList);
        } else {
            playerDataList = playerDataList.split(',');
        }
    }
    
    function createLevelSelect() {
        updateFromLocalStorage();
        renderLevelSelect();
           
    }
    
    function renderLevelSelect() {
        // display icons
        background = game.add.sprite(game.width/2, game.height/2, 'levelSelectBackground');
        background.anchor.set(0.5, 0.5);
        background.immovable = true;
        
        // horizontal offset to have lock thumbnails horizontally centered in the page
        let offsetX = (game.width - levelWidth)/2;
        let offsetY = (game.height - levelHeight)/2 + 60;
        
        let associatedLevel = 0;
        for (let i = 0; i < thumbCols; i++) {
            for (let j = 0; j < thumbRows; j++) {
                if (associatedLevel != playerDataList.length) {
                    // add lock thumbnail as button
                    let button;
                    
                    if (playerDataList[associatedLevel] == 0) {
                        // level is unlocked
                        button = game.add.button(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), 'unlockedThumbnail', function(){
                            fromMain.gameState.setLevel(associatedLevel);
                            game.state.start('game');
                        });
                    } else {
                        // level is locked
                        button = game.add.button(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), 'lockedThumbnail');
                    }
                    associatedLevel++;
                }
            } 
        }
    }
    
    return {
        preload: loadLevelSelect,
        create: createLevelSelect
    };
    
};
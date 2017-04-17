let LevelSelect = function (game) {
    
    let thumbRows = 6,
        thumbCols = 5,
        thumbWidth = 96,
        thumbHeight = 96,
        thumbSpacing = 10,
        levelWidth = thumbWidth * thumbCols + thumbSpacing * (thumbCols - 1),
        levelHeight = thumbWidth * thumbRows + thumbSpacing * (thumbRows - 1),
        playerDataList = [];
 
    function loadLevelSelect() {
        game.load.image('lockedThumbnail', 'assets/art/locked.png', thumbHeight, thumbWidth);
        game.load.image('unlockedThumbnail', 'assets/art/unlocked.png', thumbHeight, thumbWidth);
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
        
        // horizontal offset to have lock thumbnails horizontally centered in the page
        let offsetX = (game.width - levelWidth) / 2 + game.width;
        let offsetY = (game.height - levelHeight) / 2;
        
        
        
        let tempCount = playerDataList.length;
        let associatedLevel = 0;
        for (let i = 0; i < thumbCols; i++) {
            for (let j = 0; j < thumbRows; j++) {
                if (tempCount > 0) {
                    tempCount--;
                    //let levelNumber = i * thumbCols + j + 1 * (thumbRows * thumbCols); // might have to change this
                    // add lock thumbnail as button
                    let levelThumb;
                    
                    if (playerDataList[associatedLevel] == 0) {
                        // level is locked
                        levelThumb = game.add.sprite(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), 'unlockedThumbnail');
                        levelThumb.onInputDown
                    } else {
                        // level is unlocked
                        levelThumb = game.add.sprite(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), 'lockedThumbnail');
                    }
                    levelThumb.levelNumber = associatedLevel;
                    associatedLevel++;
                    
                }
            } 
        }
    }
    
    function onLevelSelected() {
        unlockedThumbnail.events.onInputDown.add(function() {
            // TAKE TO CORRECT LEVEL
            game.state.start('game',unlockedThumnail.levelNumber);        
        // MESSAGE POPUP?
        // lockedThumbnail.events.onInputDown.add() 
            }, null);
    }
    
    return {
        preload: loadLevelSelect,
        create: createLevelSelect,
        update: onLevelSelected
    };
    
};
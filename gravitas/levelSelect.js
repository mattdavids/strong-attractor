let LevelSelect = function (game, gameState) {
    
    let background,
        thumbCols = 2,
        thumbRows = 5,
        thumbWidth = 96,
        thumbHeight = 96,
        thumbSpacing = 20,
        levelWidth = thumbWidth * thumbRows + thumbSpacing * (thumbRows - 1),
        levelHeight = thumbHeight * thumbCols + thumbSpacing * (thumbCols - 1),
        currentPage = 0,
        secretPage = 0,
        playerDataList,
        secretData,
        buttons,
        controlButtons,
        levelCount,
        secretCount;
    
 
    function loadLevelSelect() {
        let levelList = game.cache.getText('levelList').split('\n');
        levelCount = levelList.length;
        
        let secretList = game.cache.getText('secretList').split('\n');
        secretCount = secretList.length;
        
        game.load.image('lockedThumbnail', 'assets/art/levelSelectImages/locked.png', thumbHeight, thumbWidth);
        game.load.image('levelSelectBackground', 'assets/art/LevelSelectBackground.png');
        game.load.image('backButton', 'assets/art/backButton.png');
        game.load.image('secretLabel', 'assets/art/secretLabel.png');
        game.load.image('secretButton', 'assets/art/secretButton.png');
        
        for (let i = 1; i <= levelCount; i ++) {
            game.load.image('icon' + i, 'assets/art/levelSelectImages/icon' + i + '.png', thumbHeight, thumbWidth);
        }
        for (let i = 1; i <= secretCount; i++) {
            game.load.image('secretIcon' + i, 'assets/art/levelSelectImages/secretIcon' + i + '.png', thumbHeight, thumbWidth);
        }
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
        
        secretData = localStorage.getItem('secret_progress').split(',');
    }
    
    function createLevelSelect() {
        updateFromLocalStorage();
        renderLevelSelect();
    }
    
    function clearLevel() {
        background.kill();
        controlButtons.destroy();
        buttons.destroy();
        texts.destroy();
    }
    
    function renderLevelSelect() {
        background = game.add.sprite(game.width/2, game.height/2, 'levelSelectBackground');
        background.anchor.set(0.5, 0.5);
        background.immovable = true;
        
        controlButtons = game.add.group();
        buttons = game.add.group();
        texts = game.add.group();
        
        let back = game.add.button(45, 56, 'backButton', function() {
            clearLevel();
            game.state.start('menu');
        });
        controlButtons.add(back);
        
        renderPage(currentPage, false);
        
        if (levelCount > thumbCols * thumbRows) {
            let down = game.add.button((game.width - levelWidth)/2 + (thumbWidth + thumbSpacing) * thumbRows + 10, (game.height - levelHeight)/2 + 10 + thumbCols * (thumbHeight + thumbSpacing), 'backButton', function() {
                currentPage = Math.min(Math.floor(levelCount/thumbRows) - 1, currentPage + 1);
                renderPage(currentPage, false);
            });
            down.angle = -90;
            controlButtons.add(down);
            
            let up = game.add.button((game.width - levelWidth)/2 + (thumbWidth + thumbSpacing) * thumbRows + 40, (game.height - levelHeight)/2 - 40 + (thumbCols - 1) * (thumbHeight + thumbSpacing), 'backButton', function() {
                currentPage = Math.max(0, currentPage - 1);
                
                renderPage(currentPage, false);
            });
            up.angle = 90;
            controlButtons.add(up);
        }
        
        if (secretData.indexOf('0') > -1) {
            let secret = game.add.button(680, 60, 'secretButton', function() {
                secretPage = 0;
                renderPage(secretPage, true);
            });
            controlButtons.add(secret);
            
        }
    }
    
    function renderPage(pageNum, isSecret) {
        // horizontal offset to have lock thumbnails horizontally centered in the page
        let offsetX = (game.width - levelWidth)/2;
        let offsetY = (game.height - levelHeight)/2 + 60;
        
        buttons.forEach(function(ele) {
            ele.kill();
        });
        texts.forEach(function(ele) {
            ele.kill();
        });
        
        currCount = levelCount;
        currDataList = playerDataList;
        
        if (isSecret) {
            controlButtons.visible = false;
            currCount = secretCount; 
            currDataList = secretData;
            
            let sign = game.add.sprite(435, 55, 'secretLabel');
            sign.anchor.set(.5, .5);
            
            let back = game.add.button(45, 56, 'backButton', function() {
                sign.destroy();
                this.destroy();
                renderPage(currentPage, false);
            });
            
        } else {
            controlButtons.visible = true;
        }
        let associatedLevel = thumbRows * pageNum;
        for (let i = 0; i < thumbCols; i++) {
            for (let j = 0; j < thumbRows; j++) {
                if (associatedLevel != currCount) {
                    
                    let button;
                    
                    if (currDataList[associatedLevel] == 0) {
                        
                        iconPrefix = 'icon';
                        if (isSecret) {
                            iconPrefix = 'secretIcon';
                        }
                        
                        // level is unlocked
                        button = game.add.button(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), iconPrefix + (associatedLevel + 1), function(){
                            clearLevel();
                            gameState.setLevel(button.associatedLevel);
                            game.state.start('game');
                        });
                        let text = game.add.text(offsetX + j * (thumbWidth + thumbSpacing) + 25 - 20 * (associatedLevel + 1> 9), offsetY + i * (thumbHeight + thumbSpacing), associatedLevel + 1, {fill: "#000", fontSize: '70px'});
                        texts.add(text);
                    } else {
                        // level is locked
                        button = game.add.sprite(offsetX + j * (thumbWidth + thumbSpacing), offsetY + i * (thumbHeight + thumbSpacing), 'lockedThumbnail');
                    }
                    button.associatedLevel = associatedLevel;
                    if(isSecret) {
                        button.associatedLevel = 'S' + associatedLevel;
                    }
                    buttons.add(button);
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
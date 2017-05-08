let OptionsHandler = function(game, optionsData, callback) {
    const plusMinusOffset = 50;
    const labelOffset = 140;
    
    let masterBarSprites = game.add.group();
    let musicBarSprites = game.add.group();
    let soundFXBarSprites = game.add.group();
    
    let optionScreen = game.add.sprite(game.width/2, game.height/2, 'blankBackground');
    optionScreen.anchor.set(.5, .5);
    
    let optionsLabel = game.add.sprite(game.width/2, game.height/2, 'optionsLabel');
    optionsLabel.anchor.set(.5, .5);
    
    let masterLabel = game.add.sprite(game.width/2 - 100, game.height - 300, 'masterAudioLabel');
    masterLabel.anchor.set(.5, .5);
    let masterBar = game.add.sprite(game.width/2, game.height - 300, 'optionsBar');
    masterBar.anchor.set(.5, .5);
    let masterBarPlus = game.add.button(masterBar.x + masterBar.width/2 + plusMinusOffset, masterBar.y, 'addButton', masterBarInc, this);
    masterBarPlus.anchor.set(.5, .5);
    let masterBarMinus = game.add.button(masterBar.x - masterBar.width/2 - plusMinusOffset, masterBar.y, 'minusButton', masterBarDec, this);
    masterBarMinus.anchor.set(.5, .5);
    
    let musicLabel = game.add.sprite(game.width/2 - 100, game.height - 200, 'musicAudioLabel');
    musicLabel.anchor.set(.5, .5);
    let musicBar = game.add.sprite(game.width/2, game.height - 200, 'optionsBar');
    musicBar.anchor.set(.5, .5);
    let musicBarPlus = game.add.button(musicBar.x + musicBar.width/2 + plusMinusOffset, musicBar.y, 'addButton', musicBarInc);
    musicBarPlus.anchor.set(.5, .5);
    let musicBarMinus = game.add.button(musicBar.x - musicBar.width/2 - plusMinusOffset, musicBar.y, 'minusButton', musicBarDec);
    musicBarMinus.anchor.set(.5, .5);
    
    let soundFXLabel = game.add.sprite(game.width/2 - 100, game.height - 100, 'soundFXAudioLabel');
    soundFXLabel.anchor.set(.5, .5);
    let soundFXBar = game.add.sprite(game.width/2, game.height - 100, 'optionsBar');
    soundFXBar.anchor.set(.5, .5);
    let soundFXBarPlus = game.add.button(soundFXBar.x + soundFXBar.width/2 + plusMinusOffset, soundFXBar.y, 'addButton', soundFXBarInc);
    soundFXBarPlus.anchor.set(.5, .5);
    let soundFXBarMinus = game.add.button(soundFXBar.x - soundFXBar.width/2 - plusMinusOffset, soundFXBar.y, 'minusButton', soundFXBarDec);
    soundFXBarMinus.anchor.set(.5, .5);
    
    let back = game.add.button(45, 56, 'backButton', function() {
        buttons.forEach(function(ele) {
            ele.visible = false;
        });
        
        masterBarSprites.removeAll(true);
        musicBarSprites.removeAll(true);
        soundFXBarSprites.removeAll(true);

        callback();
    });
    back.anchor.set(.5, .5);
    
    let buttons = game.add.group();
    
    buttons.add(optionScreen);
    
    buttons.add(back);
    
    buttons.add(optionsLabel);
    
    buttons.add(masterLabel);
    buttons.add(masterBar);
    buttons.add(masterBarPlus);
    buttons.add(masterBarMinus);
     
    buttons.add(musicLabel);
    buttons.add(musicBar);
    buttons.add(musicBarPlus);
    buttons.add(musicBarMinus);
    
    buttons.add(soundFXLabel);
    buttons.add(soundFXBar);
    buttons.add(soundFXBarPlus);
    buttons.add(soundFXBarMinus);
    
    buttons.forEach(function(ele) {
        ele.visible = false;
    });
    
    let jumpSound = game.add.audio('jump4');
    
    function startOptionsMenu() {
        game.world.bringToTop(buttons);
        
        game.world.bringToTop(masterBarSprites);
        game.world.bringToTop(musicBarSprites);
        game.world.bringToTop(soundFXBarSprites);
        
        let centerX = game.camera.view.centerX;
        let centerY = game.camera.view.centerY;
        
        optionScreen.position.set(centerX, centerY);

        masterBar.position.setTo(centerX + 100, centerY - 50);
        musicBar.position.setTo(centerX + 100, centerY + 20);
        soundFXBar.position.setTo(centerX + 100, centerY + 90);
        
        masterLabel.position.set(masterBar.x - masterBar.width/2 - plusMinusOffset - labelOffset, masterBar.y);
        masterBarPlus.position.setTo(masterBar.x + masterBar.width/2 + plusMinusOffset, masterBar.y);
        masterBarMinus.position.setTo(masterBar.x - masterBar.width/2 - plusMinusOffset, masterBar.y);
        
        musicLabel.position.set(musicBar.x - musicBar.width/2 - plusMinusOffset - labelOffset, musicBar.y);
        musicBarPlus.position.setTo(musicBar.x + musicBar.width/2 + plusMinusOffset, musicBar.y);
        musicBarMinus.position.setTo(musicBar.x - musicBar.width/2 - plusMinusOffset, musicBar.y);
        
        soundFXLabel.position.set(soundFXBar.x - soundFXBar.width/2 - plusMinusOffset - labelOffset, soundFXBar.y);
        soundFXBarPlus.position.setTo(soundFXBar.x + soundFXBar.width/2 + plusMinusOffset, soundFXBar.y);
        soundFXBarMinus.position.setTo(soundFXBar.x - soundFXBar.width/2 - plusMinusOffset, soundFXBar.y);
        
        back.position.set(centerX - 320, centerY - 150);
        
        optionsLabel.position.set(centerX + 100, centerY - 130);
        
        drawBarSprites(masterBar, masterBarSprites, optionsData.master);
        drawBarSprites(musicBar, musicBarSprites, optionsData.music);
        drawBarSprites(soundFXBar, soundFXBarSprites, optionsData.soundFX);
        
        buttons.forEach(function(ele) {
            ele.visible = true;
        });
        
    }
    
    function updateThemeVolume() {
        $('#mainTheme')[0].volume = optionsData.master * optionsData.music;
    } 

    function drawBarSprites(bar, group, data) {
        group.removeAll(true);
        for (let i = 0; i < data * 10; i ++) {
            let coin = game.add.sprite(bar.x  - bar.width/2 + (i/10 * (bar.width - 3)) + 18, bar.y, 'coin');
            coin.width = 30;
            coin.height = 30;
            coin.anchor.set(.5, .5);
            group.add(coin);
        }
    }
    
    function masterBarInc() {
        optionsData.master = Math.round(Math.min(10, optionsData.master * 10 + 1))/10;
        drawBarSprites(masterBar, masterBarSprites, optionsData.master);
        updateThemeVolume();

    }
    function masterBarDec() {
        optionsData.master = Math.round(Math.max(0, optionsData.master * 10 - 1))/10;
        drawBarSprites(masterBar, masterBarSprites, optionsData.master);
        updateThemeVolume();
    }
    function musicBarInc() {
        optionsData.music = Math.round(Math.min(10, optionsData.music * 10 + 1))/10;
        drawBarSprites(musicBar, musicBarSprites, optionsData.music);
        updateThemeVolume();
    }
    function musicBarDec() {
        optionsData.music = Math.round(Math.max(0, optionsData.music * 10 - 1))/10;
        drawBarSprites(musicBar, musicBarSprites, optionsData.music);
        updateThemeVolume();
    }
    function soundFXBarInc() {
        optionsData.soundFX = Math.round(Math.min(10, optionsData.soundFX * 10 + 1))/10;
        drawBarSprites(soundFXBar, soundFXBarSprites, optionsData.soundFX);
        jumpSound.volume = 0.1 * optionsData.master * optionsData.soundFX;
        jumpSound.play();
    }
    function soundFXBarDec() {
        optionsData.soundFX = Math.round(Math.max(0, optionsData.soundFX * 10 - 1))/10;
        drawBarSprites(soundFXBar, soundFXBarSprites, optionsData.soundFX);
        jumpSound.volume = 0.1 * optionsData.master * optionsData.soundFX;
        jumpSound.play();
    }
    
    return {
        startOptionsMenu: startOptionsMenu,
    }
    
}
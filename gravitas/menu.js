let Menu = function(game, optionsData, startGameFromMenuCallback, goToLevelSelectFromMenuCallback) {
    
    //game.state.add('levelselect', {preload: levelSelect.preload, create: levelSelect.create, update: levelSelect.onLevelSelected});

    let startBtn, levelSelectBtn, optionsButton, background, flame1, flame2, playerDataList, secretData;
    let fadeIn = true;
    let optionsHandler;

    function clearLevel() {
        background.kill();
        startBtn.kill();
        levelSelectBtn.kill();
        /*
        flame1.kill();
        flame2.kill();
        */
    }

    function loadMenu() {
        game.load.image('background', 'assets/art/MenuBackground2.png');
        game.load.image('startBtn', 'assets/art/startButton.png');
        game.load.image('levelSelectBtn', 'assets/art/levelSelectButton.png');
        //game.load.spritesheet('flame', 'assets/art/fire_sprites.png', 45, 60, 12);
        game.load.image('optionsButton', 'assets/art/optionsButton.png');
        game.load.image('optionsBar', 'assets/art/optionsBar.png');
        game.load.image('addButton', 'assets/art/addButton.png');
        game.load.image('minusButton', 'assets/art/minusButton.png');
        game.load.image('backButton', 'assets/art/backButton.png');
        game.load.image('coin', 'assets/art/coin.png')
        game.load.image('circle', 'assets/art/gravCircle.png');
        game.load.image('blankBackground', 'assets/art/blankBackground.png');
        game.load.image('masterAudioLabel', 'assets/art/masterAudioLabel.png');
        game.load.image('musicAudioLabel', 'assets/art/musicAudioLabel.png');
        game.load.image('soundFXAudioLabel', 'assets/art/soundFXAudioLabel.png');
        game.load.image('optionsLabel', 'assets/art/optionsLabel.png');
        game.load.image('gravParticle', 'assets/art/gravParticle.png');
        
        game.load.audio('jump4', ['assets/audio/Jump4.mp3', 'assets/audio/Jump4.ogg']);
    }

    function createMenu() {
        background = game.add.sprite(game.width/2, game.height/2, 'background');
        background.anchor.set(0.5, 0.5);
        background.immovable = true;

        let horizOffset = 120;
        let vertOffset = 10;
        let horizSpacing = 95;
        startBtn = game.add.button(game.width/2 - horizOffset, game.height/2 + vertOffset, 'startBtn', onStartButtonPush);
        startBtn.anchor.set(0.5, 0.5);

        levelSelectBtn = game.add.button(game.width/2 - horizOffset, game.height/2 + vertOffset + horizSpacing, 'levelSelectBtn', onLevelSelectButtonPush, null);
        levelSelectBtn.anchor.set(0.5, 0.5);
        
        optionsButton = game.add.button(game.width - 37, game.height - 30, 'optionsButton', onOptionsPush, null);
        optionsButton.anchor.set(.5, .5);

        if (fadeIn) {
            game.camera.flash(0x000000, 1500);
            fadeIn = false;
        }

        optionsHandler = new OptionsHandler(game, optionsData, function() {
            background.visible = true;
            startBtn.visible = true;
            levelSelectBtn.visible = true;
            optionsButton.visible = true;
        });
        
        /*
        // THERE NEEDS TO BE A BETTER WAY TO DO THIS
        let flame_height = game.height/2 + 9;

        flame1 = game.add.sprite(97, flame_height, 'flame');
        flame1.anchor.set(.5, .5);
        flame1.animations.add('flicker1');
        flame1.animations.play('flicker1', 20, true);

        flame2 = game.add.sprite(710, flame_height, 'flame');
        flame2.anchor.set(.5, .5);
        flame2.animations.add('flicker2');
        flame2.animations.play('flicker2', 20, true);
        */
        
        if (localStorage.getItem('secret_progress') == null) {
            let secretList = game.cache.getText('secretList').split('\n');
            secretData = [];
            for (let i = 0; i < secretList.length; i++) {
                secretData[i] = 1;
            }
            localStorage.setItem('secret_progress', secretData);
        }
    }
    
    function renewProgressLocalStorage() {
        let levelList = game.cache.getText('levelList').split('\n');
        playerDataList = [0];
        for (let i = 1; i < levelList.length; i++) {
            playerDataList[i] = 1;
        }
        localStorage.setItem('user_progress', playerDataList);
    }

    function onStartButtonPush() {
        clearLevel();
        renewProgressLocalStorage();
        startGameFromMenuCallback();
    }
    
    function onOptionsPush() {
        background.visible = false;
        startBtn.visible = false;
        levelSelectBtn.visible = false;
        optionsButton.visible = false;
        
        optionsHandler.startOptionsMenu();
    }

    function onLevelSelectButtonPush() {
        clearLevel();
        goToLevelSelectFromMenuCallback();
        
    }

    return {
        loadMenu: loadMenu,
        createMenu: createMenu,
    }
};
let Menu = function(game, startGameFromMenuCallback, goToLevelSelectFromMenuCallback) {
    
    //game.state.add('levelselect', {preload: levelSelect.preload, create: levelSelect.create, update: levelSelect.onLevelSelected});

    let startBtn, levelSelectBtn, background, flame1, flame2, playerDataList;
    let fadeIn = true;

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

        levelSelectBtn = game.add.button(game.width/2 - horizOffset, game.height/2 + vertOffset + horizSpacing, 'levelSelectBtn', onLevelSelectButtonPush);
        levelSelectBtn.anchor.set(0.5, 0.5);

        game.camera.flash(0x000000, 1500);
        let mainTheme = $('#mainTheme');
        mainTheme.prop("volume", 0.1);
        mainTheme.trigger("play");
        mainTheme.animate({volume: 1}, 1500);
        
        let slowTheme = $('#slowTheme');
        slowTheme[0].playbackRate = 2;
        slowTheme[0].volume = 0;
        slowTheme.trigger('play');

        if (fadeIn) {
            game.camera.flash(0x000000, 1500);
            fadeIn = false;
        }
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

    function onLevelSelectButtonPush() {
        clearLevel();
        goToLevelSelectFromMenuCallback();
    }

    return {
        loadMenu: loadMenu,
        createMenu: createMenu
    }
};
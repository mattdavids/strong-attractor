let Win = function(game, returnFromWinCallback) {
    let winScreen,
        menuButton,
        flag,
        displayFlag;

    function backToMenu() {
        winScreen.kill();
        flag.kill();
        menuButton.kill();
        returnFromWinCallback()
    }

    return {
        loadWin: function() {
            game.load.image('winScreen', 'assets/art/winScreen.png');
            game.load.image('menuButton', 'assets/art/menuButton.png');
            game.load.spritesheet('flag', 'assets/art/flagSpritesheet.png', 85, 152, 9);
        },

        displayWinMessage: function() {

            winScreen = game.add.sprite(game.width/2, game.height/2, 'winScreen');
            winScreen.anchor.set(0.5, 0.5);
            winScreen.immovable = true;

            menuButton = game.add.button(game.width/2, 1.4*game.height/2, 'menuButton', backToMenu);
            menuButton.anchor.set(0.5, 0.5);

            flag = game.add.sprite(360, 30, 'flag');
            displayFlag = flag.animations.add('displayFlag');
            displayFlag.enableUpdate = true;
            flag.animations.play('displayFlag', 10, false);
        }

    }
};
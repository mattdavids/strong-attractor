let Win = function(game, returnFromWinCallback) {
    let restartBtn;

    return {
        loadWin: function() {
            game.load.image('winScreen', 'assets/art/winScreen.png');
            game.load.image('restartBtn', 'assets/art/restartButton.png');
        },

        displayWinMessage: function() {
            let winScreen = game.add.sprite(game.width/2, game.height/2, 'winScreen');
            winScreen.anchor.set(0.5, 0.5);
            winScreen.immovable = true;

            restartBtn = game.add.sprite(game.width/2, 1.5*game.height/2, 'restartBtn');
            restartBtn.anchor.set(0.5, 0.5);
            restartBtn.inputEnabled = true;
        },

        backToMenu: function() {
            winScreen.kill();
            restartBtn.kill();
            restartBtn.events.onInputDown.add(returnFromWinCallback, null);
        }
    }
};

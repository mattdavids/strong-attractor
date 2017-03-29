let Menu = function(game, startGameFromMenuCallback) {
    let startBtn;

    return {
        loadMenu: function() {
            game.load.image('background', 'assets/art/MenuBackground.png');
            game.load.image('startBtn', 'assets/art/startButton.png');
        },

        createMenu: function() {
            let background = game.add.sprite(game.width/2, game.height/2, 'background');
            background.anchor.set(0.5, 0.5);
            background.immovable = true;

            startBtn = game.add.sprite(game.width/2, game.height/2, 'startBtn');
            startBtn.anchor.set(0.5, 0.5);
            startBtn.inputEnabled = true;
        },

        onStartButtonPush: function() {
            startBtn.events.onInputDown.add(startGameFromMenuCallback, null);
        }
    }
};
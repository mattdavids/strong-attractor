let Menu = function(game, startGameFromMenuCallback) {
    let startBtn;

    return {
        loadMenu: function() {
            game.load.image('background', 'assets/art/MenuBackground.png');
            game.load.image('startBtn', 'assets/art/startButton.png');
            game.load.spritesheet('flame', 'assets/art/fire_sprites.png', 45, 60, 12);
        },

        createMenu: function() {
            let background = game.add.sprite(game.width/2, game.height/2, 'background');
            background.anchor.set(0.5, 0.5);
            background.immovable = true;

            startBtn = game.add.sprite(game.width/2, game.height/2 + 40, 'startBtn');
            startBtn.anchor.set(0.5, 0.5);
            startBtn.inputEnabled = true;
            
            
            // THERE NEEDS TO BE A BETTER WAY TO DO THIS
            flame_height = game.height/2 + 9;
            
            flame1 = game.add.sprite(97, flame_height, 'flame');
            flame1.anchor.set(.5, .5);
            flame1.animations.add('flicker1');
            flame1.animations.play('flicker1', 20, true);   
            
            flame2 = game.add.sprite(710, flame_height, 'flame');
            flame2.anchor.set(.5, .5);
            flame2.animations.add('flicker2');
            flame2.animations.play('flicker2', 20, true); 
        },

        onStartButtonPush: function() {
            startBtn.events.onInputDown.add(startGameFromMenuCallback, null);
        }
    }
};
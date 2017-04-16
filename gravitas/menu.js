let Menu = function(game, startGameFromMenuCallback, goToLevelSelectFromMenuCallback) {
    let startBtn, levelSelectBtn, background, flame1, flame2;

    function clearLevel() {
        background.kill();
        startBtn.kill();
        levelSelectBtn.kill();
        flame1.kill();
        flame2.kill();
    }
    
    return {
        loadMenu: function() {
            game.load.image('background', 'assets/art/MenuBackground.png');
            game.load.image('startBtn', 'assets/art/startButton.png');
            game.load.image('levelSelectBtn', 'assets/art/levelSelectButton.png');
            game.load.spritesheet('flame', 'assets/art/fire_sprites.png', 45, 60, 12);
        },

        createMenu: function() {            
            background = game.add.sprite(game.width/2, game.height/2, 'background');
            background.anchor.set(0.5, 0.5);
            background.immovable = true;

            startBtn = game.add.sprite(game.width/2, game.height/2 + 55, 'startBtn');
            startBtn.anchor.set(0.5, 0.5);
            startBtn.inputEnabled = true;
            
            levelSelectBtn = game.add.sprite(game.width/2, game.height/2 + 135, 'levelSelectBtn');
            levelSelectBtn.anchor.set(0.5, 0.5);
            levelSelectBtn.inputEnabled = true;
            
            
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
        },
        onButtonPush: function() {
            startBtn.events.onInputDown.add(function() {
                clearLevel();                
                startGameFromMenuCallback();
            }, null);
            
            levelSelectBtn.events.onInputDown.add(function() {
                clearLevel();
                goToLevelSelectFromMenuCallback();
            }, null);
        }        
        
    }
};
let StartState = function(game) {
    return {
        boot: function() {
            // Load file lists here
            game.load.text('levelList', 'assets/levels/levelList.txt');
            
            game.load.audio('theme', ['assets/audio/gravitasTheme.mp3', 'assets/audio/gravitasTheme.ogg']);
            // need .ogg if using Firefox
            
            game.stage.smoothed = false;
            game.scale.maxWidth = window.innerWidth;
            game.scale.maxHeight = window.innerHeight - 20;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            
        },
        postBoot: function() {
            // Immediately run menu once boot-loading is finished
            let music = game.add.audio('theme');
            music.volume = 0.3;
            music.loop = true;
            music.play();
            
            game.state.start('menu');
        }
    };
};
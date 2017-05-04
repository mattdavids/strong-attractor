let BootState = function(game) {
    
    function resizeGame() {
        game.scale.maxWidth = window.innerWidth/(1.5);
        game.scale.maxHeight = game.scale.maxWidth * (42/81);
    }

    return {
        boot: function() {
            // Load file lists here
            game.load.text('levelList', 'assets/levels/levelList.txt');
            
            game.load.audio('theme', ['assets/audio/gravitasTheme.mp3', 'assets/audio/gravitasTheme.ogg']);
            // need .ogg if using Firefox
            
            game.stage.smoothed = false;
            resizeGame();
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            
        },
        postBoot: function() {
            // Immediately run menu once boot-loading is finished
            //music = game.add.audio('theme');
            //music.volume = 0.3;
            //music.loop = true;
            //music.onDecoded.add(function() {
            //    music.fadeIn(1000);
            //});
            
            // Pause music when the window loses focus
            $(window).focus(function() {
                $('#mainTheme')[0].play();
                $('#slowTheme')[0].play();
            });
            $(window).blur(function() {
                $('#mainTheme')[0].pause();
                $('#slowTheme')[0].pause();
            });
            $(window).resize(resizeGame);
            
            game.state.start('menu');
        }
    };
};
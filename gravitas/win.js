let Win = function(game, optionsData) {
    let winScreen,
        menuButton,
        flag,
        displayFlag,
        emitters,
        currentFirework;

    function backToMenu() {
        winScreen.kill();
        flag.kill();
        menuButton.kill();
        game.state.start('menu');
    }
    
    function rainbow() {
        let options = ['0xffffff', '0xff0000', '0xffa500', '0xffff00', '0x00ff00', '0x00ffa5'];
        var letters = '0123456789ABCDE'.split('');
        var color = '0x';
        for (var i=0; i<3; i++ ) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return options[Math.floor(Math.random() * options.length)];
        return color;
    }
    
    function quadraticEase(t, tmax) {
        return 1 - Math.pow(tmax - t, 2)/Math.pow(tmax, 2);
    }
    
    function update() {
        if(Math.random() > .95) {
            let emitter = game.add.emitter(Math.random() * 600 + 100, Math.random() * 100 + 45);
            let numParticles = Math.random() * 30 + 20;
            let color = rainbow();

            emitter.makeParticles('gravParticle', 0, numParticles, true);
            emitter.forEach(function(particle) {
                particle.tint = color;
            });
            emitter.minParticleScale = .3;
            emitter.maxParticleScale = .5;
            emitter.width = 20;
            emitter.start(true, 2000, null, numParticles);
            game.time.events.add(2500, function() {
                emitter.destroy(true);
            }, null);
            emitters.add(emitter);
            let firework = game.add.audio('firework' + currentFirework);
            firework.volume = .02 * optionsData.master * optionsData.soundFX;
            firework.play();
            currentFirework = (currentFirework) % 3 + 1
        }
        
        emitters.forEach(function(emitter) {
            emitter.forEachAlive(function(p) {
                p.alpha = quadraticEase(p.lifespan, emitter.lifespan);
            }, null);
        }, null);
    }

    return {
        loadWin: function() {
            game.load.image('winScreen', 'assets/art/winScreen.png');
            game.load.image('menuButton', 'assets/art/menuButton.png');
            game.load.image('gravParticle', 'assets/art/gravParticle.png');
            game.load.spritesheet('flag', 'assets/art/flagSpritesheet.png', 85, 152, 9);
            game.load.audio('firework1', 'assets/audio/firework1.mp3');
            game.load.audio('firework2', 'assets/audio/firework2.mp3');
            game.load.audio('firework3', 'assets/audio/firework3.mp3');
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
            
            emitters = game.add.group();
            
            currentFirework = 1;
            
        },        
        update: update,

    }
};
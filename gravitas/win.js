let Win = function(game) {
    let winScreen,
        menuButton,
        flag,
        displayFlag,
        emitters;

    function backToMenu() {
        winScreen.kill();
        flag.kill();
        menuButton.kill();
        game.state.start('menu');
    }
    
    function quadraticEase(t, tmax) {
        return 1 - Math.pow(tmax - t, 2)/Math.pow(tmax, 2);
    }
    
    function update() {
        if(Math.random() > .95) {
            let emitter = game.add.emitter(Math.random() * 600 + 100, Math.random() * 100 + 45);
            let numParticles = Math.random() * 30 + 20;

            emitter.makeParticles('gravParticle', 0, numParticles, true);
            emitter.minParticleScale = .3;
            emitter.maxParticleScale = .5;
            emitter.width = 20;
            emitter.start(true, 2000, null, numParticles);
            game.time.events.add(2500, function() {
                emitter.destroy(true);
            }, null);
            emitters.add(emitter);
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
            
        },        
        update: update,

    }
};
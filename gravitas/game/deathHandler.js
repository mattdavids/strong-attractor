let DeathHandler = function() {
    let deathFall = false;
    let deathTick = 0;
    let diedRecently = false;
    let notCurrentlyDying = true;
    
    const deathFallSpeed = 6;
    const deathAnimationTime = 300;
    
    // Starts the death animation by setting flags. Freezes the player, pauses the game state, shakes the screen, then sets a timer to set the deathFall flag which is run in update
    function deathAnimation(game, player) {
        if (!this.diedRecently) {
            this.notCurrentlyDying = false;
            game.physics.arcade.isPaused = true;
            player.body.allowGravity = false;
            player.body.velocity = new Phaser.Point(0, 0);
            let deathSound = game.add.audio('death');
            deathSound.volume = 0.01;
            deathSound.allowMultiple = false;
            deathSound.play();
            game.time.events.add(0, function() {
                game.camera.shake(.008, deathAnimationTime);
            }, this);
            game.time.events.add(deathAnimationTime + 100, function() {
                this.deathFall = true;
                this.deathTick = 0;
            }, this);
        }
    }
    
    
    function doDeathFallAnimation(game, player, blockSize, callback) {
        let movement;
        if (Math.abs((Math.pow(this.deathTick - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)) > blockSize) {
            movement = blockSize;
        } else {
            movement = (Math.pow(this.deathTick - deathFallSpeed, 2) - Math.pow(deathFallSpeed, 2))/(blockSize/2)
        }

        player.y += movement;
        if (player.y > game.world.height + 3 * blockSize) {
            callback();
            this.deathFall = false;
            this.diedRecently = true;
            this.notCurrentlyDying = true;
            game.physics.arcade.isPaused = false;
            game.time.events.add(100, function() {
                this.diedRecently = false;
            }, this);
        }
        this.deathTick += 1;
    }
    
    
    return {
        deathFall: deathFall,
        deathTick: deathTick,
        diedRecently: diedRecently,
        notCurrentlyDying: notCurrentlyDying,
        doDeathFallAnimation: doDeathFallAnimation,
        deathAnimation: deathAnimation,
    }
};
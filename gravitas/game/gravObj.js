let GravObj = function(game, x, y, gravMin, gravMax, gravOn, flux, moving, movementList) {
    const circleRadius = 259;
    const gravCoef = 150000;

    // GETTERS
    function getGravObjRadius() {
        return this.gravWeight / gravCoef * circleRadius;
    }

    function getRandomPositionInCircle(gravObj) {
        let r = gravObj.radius - 5;
        let angle = Math.random() * 2 * Math.PI;
        let radiusAmount = Math.random() * 0.4 + 0.59;
        return new Phaser.Point(gravObj.x + radiusAmount * r * Math.cos(angle),
                                gravObj.y + radiusAmount * r * Math.sin(angle));
    }

    function getNumParticles() {
        return 25 * Math.log(this.radius);
    }

    function getParticleLife() {
        return this.radius;
    }


    // STATIC PRIVATE METHODS
    function addParticles(gravObj, numToAdd) {
        for (let i = 0; i < numToAdd; i++) {
            let p = game.add.sprite(gravObj.x, gravObj.y, 'gravParticle');
            p.scale.setTo(.3);
            p.anchor.set(0.5, 0.5);
            p.life = gravObj.particleLife * Math.random();
            p.gravConstant = 0; // this needs to be 0 so that particles are not affected by gravity until they're active
            p.visible = false;
            gravObj.gravParticles.add(p);
        }
    }

    function checkParticleNumbers(gravObj) {
        // if grav obj's weight has changed, then check if we have too many or too few particles
        let numNeeded = Math.trunc(gravObj.numParticles - gravObj.gravParticles.children.length);
        if (numNeeded < 0) {
            gravObj.gravParticles.forEach(function (p) {
                if (p.life <= 0 || p.life >= gravObj.particleLife) {
                    p.destroy();
                }
            }, null);
        } else if (numNeeded > 0) {
            addParticles(gravObj, numNeeded);
        }
    }


    // PUBLIC
    function animateParticles() {
        checkParticleNumbers(this);
        let pos = this.position;
        let rad = this.radius;
        let particleLife = this.particleLife;
        this.gravParticles.forEach(function(p) {
            // Gaussian curve for fading in and out
            p.alpha = Math.exp(- Math.pow(p.life - particleLife/2, 2) / 5000);
            if (p.life > particleLife) {
                p.life -= 1;
            } else if (p.life <= 0) {
                p.position = getRandomPositionInCircle(this);
                p.body.velocity.set(0, 0);
                p.life = particleLife * (1+Math.random());
                p.visible = false;
                p.gravConstant = 0;
            } else {
                p.life -= 1;
                p.visible = true;
                p.gravConstant = 0.03;

                // Check if particle is still in the radius
                let dx = pos.x - p.x;
                let dy = pos.y - p.y;
                let distDiff = rad*rad - (dx*dx + dy*dy);
                if (distDiff < 0){
                    p.life -= 5;
                }
            }
        }, this);
    }
    
    function resetWeight() {
        this.gravWeight = ((this.gravMin + this.gravMax)/2) * this.gravOn * !this.flux;
    }

    let gravObj = game.add.sprite(x, y, 'gravObj');
    gravObj.anchor.set(.5, .5);
    gravObj.gravWeight = ((gravMin + gravMax)/2) * gravOn * !flux;
    gravObj.gravOn = gravOn;
    gravObj.gravMin = gravMin;
    gravObj.gravMax = gravMax;
    gravObj.body.immovable = true;
    gravObj.inputEnabled = true;
    gravObj.flux = flux;
    gravObj.moving = moving;
    gravObj.movementList = movementList;
    gravObj.movementIndex = 0;
    gravObj.weightHasBeenChanged = true;
    gravObj.gravCircles = game.add.group();
    if (flux) {
        gravObj.fluxConst = 1;
    }
    gravObj.gravParticles = game.add.group();

    Object.defineProperties(gravObj, {
        radius: {
            get: getGravObjRadius
        },
        numParticles: {
            get: getNumParticles
        },
        particleLife: {
            get: getParticleLife
        }
    });
    gravObj.animateParticles = animateParticles;
    gravObj.resetWeight = resetWeight;
    addParticles(gravObj, gravObj.numParticles);

    return gravObj;
};
let GravObjMaker = function(game, x, y, gravMin, gravMax, gravOn, flux, moving, movementList) {
    const circleRadius = 259;
    const gravCoef = 150000;
    const particleLife = 180;

    // GETTERS
    function getGravObjRadius() {
        return this.gravWeight / gravCoef * circleRadius;
    }

    function getRandomPositionInCircle() {
        let r = this.radius - 5;
        let angle = Math.random() * 2 * Math.PI;
        let radiusAmount = Math.random() * 0.4 + 0.59;
        return new Phaser.Point(this.x + radiusAmount * r * Math.cos(angle),
                                this.y + radiusAmount * r * Math.sin(angle));
    }

    function getNumParticles() {
        return 50 * Math.log(this.radius);
        //return Math.pow(this.radius, 2) / 1000;
    }


    // PRIVATE
    function addParticles(gravObj, numToAdd) {
        for (let i = 0; i < numToAdd; i++) {
            let p = game.add.sprite(gravObj.x, gravObj.y, 'gravParticle');
            p.scale.setTo(.3);
            p.anchor.set(0.5, 0.5);
            p.life = particleLife + particleLife / gravObj.numParticles * (Math.random() + i);
            p.gravConstant = 0; // this will actually be set when the particle is emitted
            p.visible = false;
            gravObj.gravParticles.add(p);
        }
    }

    function checkParticleNumbers(gravObj) {
        let numNeeded = Math.trunc(gravObj.numParticles - gravObj.gravParticles.children.length);
        if (numNeeded < 0) {
            gravObj.gravParticles.forEach(function (p) {
                if (p.life <= 0 || p.life >= particleLife) {
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
        this.gravParticles.forEach(function(p) {
            // Gaussian curve for fading in and out
            p.alpha = Math.exp(- Math.pow(p.life - particleLife/2, 2) / 5000);
            if (p.life <= 0 || (!p.visible && p.life < particleLife)) {
                p.position = this.randomPos;
                p.body.velocity.set(0, 0);
                p.life = particleLife * (1 + Math.random());
                p.gravConstant = .03;
                p.visible = false;
            } else {
                p.life -= 1;
                p.visible = true;

                // Check if particle is still in the radius
                let dx = pos.x - p.x;
                let dy = pos.y - p.y;
                let distDiff = rad*rad - (dx*dx + dy*dy);
                if(distDiff < 0){
                    p.life -=5;
                }
            }
        }, this);
    }

    let gravObj = game.add.sprite(x, y, 'gravObj');
    gravObj.anchor.set(.5, .5);
    gravObj.gravWeight = ((gravMin + gravMax)/2) * gravOn * !flux;
    gravObj.gravMin = gravMin;
    gravObj.gravMax = gravMax;
    gravObj.body.immovable = true;
    gravObj.inputEnabled = true;
    gravObj.flux = flux;
    gravObj.moving = moving;
    gravObj.movementList = movementList;
    gravObj.movementIndex = 0;
    if (flux) {
        gravObj.fluxConst = 1;
    }
    gravObj.gravParticles = game.add.group();

    Object.defineProperties(gravObj, {
        radius: {
            get: getGravObjRadius
        },
        randomPos: {
            get: getRandomPositionInCircle
        },
        numParticles: {
            get: getNumParticles
        }
    });
    gravObj.animateParticles = animateParticles;
    addParticles(gravObj, gravObj.numParticles);

    return gravObj;
};
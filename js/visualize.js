
/*
    De meest enge visualizer voor HTML5 die ik kon vinden,
    Wel goed aangepast
 */

var globvars = {};

(function() {
    var ALPHA, AudioAnalyser, COLORS, MP3_PATH, NUM_BANDS, NUM_PARTICLES, Particle, SCALE, SIZE, SMOOTHING, SPEED, SPIN;

    NUM_PARTICLES = 15;

    NUM_BANDS = 128;

    SMOOTHING = 0.5;

    MP3_PATH = 'https://files.freemusicarchive.org/music%2Fno_curator%2FRyan_Little%2FRyan_Little_-_Singles%2FRyan_Little_-_Summer_Dreams.mp3';

    SCALE = {
        MIN: 5.0,
        MAX: 80.0
    };

    SPEED = {
        MIN: 0.2,
        MAX: 1.0
    };

    ALPHA = {
        MIN: 0.8,
        MAX: 0.9
    };

    SPIN = {
        MIN: 0.001,
        MAX: 0.005
    };

    SIZE = {
        MIN: 0.5,
        MAX: 1.25
    };

    COLORS = ['#69D2E7', '#1B676B', '#BEF202', '#EBE54D', '#00CDAC', '#1693A5', '#F9D423', '#FF4E50', '#E7204E', '#0CCABA', '#FF006F'];

    AudioAnalyser = (function() {
        AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

        AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

        function AudioAnalyser(audio, numBands, smoothing) {
            var src;
            this.audio = audio != null ? audio : new Audio();
            this.numBands = numBands != null ? numBands : 256;
            this.smoothing = smoothing != null ? smoothing : 0.3;
            if (typeof this.audio === 'string') {
                src = this.audio;
                this.audio = new Audio();
                this.audio.crossOrigin = "anonymous";
                this.audio.controls = true;
                this.audio.src = src;
            }
            this.audioContext = new AudioAnalyser.AudioContext();
            this.jsNode = this.audioContext.createScriptProcessor(2048, 1, 1);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.smoothingTimeConstant = this.smoothing;
            this.analyser.fftSize = this.numBands * 2;
            this.bands = new Uint8Array(this.analyser.frequencyBinCount);
            this.audio.addEventListener('canplay', (function(_this) {
                return function() {
                    _this.source = _this.audioContext.createMediaElementSource(_this.audio);
                    _this.source.connect(_this.analyser);
                    _this.analyser.connect(_this.jsNode);
                    _this.jsNode.connect(_this.audioContext.destination);
                    _this.source.connect(_this.audioContext.destination);
                    return _this.jsNode.onaudioprocess = function() {
                        _this.analyser.getByteFrequencyData(_this.bands);
                        if (!_this.audio.paused) {
                            return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
                        }
                    };
                };
            })(this));
        }

        AudioAnalyser.prototype.start = function() {
            return this.audio.play();
        };

        AudioAnalyser.prototype.stop = function() {
            return this.audio.pause();
        };

        return AudioAnalyser;

    })();

    Particle = (function() {
        function Particle(x1, y1) {
            this.x = x1 != null ? x1 : 0;
            this.y = y1 != null ? y1 : 0;
            this.reset();
        }

        Particle.prototype.reset = function() {
            this.level = 1 + floor(random(4));
            this.scale = random(SCALE.MIN, SCALE.MAX);
            this.alpha = random(ALPHA.MIN, ALPHA.MAX);
            this.speed = random(SPEED.MIN, SPEED.MAX);
            this.color = random(COLORS);
            this.size = random(SIZE.MIN, SIZE.MAX);
            this.spin = random(SPIN.MAX, SPIN.MAX);
            this.band = floor(random(NUM_BANDS));
            if (random() < 0.5) {
                this.spin = -this.spin;
            }
            this.smoothedScale = 0.0;
            this.smoothedAlpha = 0.0;
            this.decayScale = 0.0;
            this.decayAlpha = 0.0;
            this.rotation = random(TWO_PI);
            return this.energy = 0.0;
        };

        Particle.prototype.move = function() {
            this.rotation += this.spin;
            return this.y -= this.speed * this.level;
        };

        Particle.prototype.draw = function(ctx) {
            var alpha, power, scale;
            power = exp(this.energy);
            scale = this.scale * power;
            alpha = this.alpha * this.energy * 1.5;
            this.decayScale = max(this.decayScale, scale);
            this.decayAlpha = max(this.decayAlpha, alpha);
            this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
            this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;
            this.decayScale *= 0.985;
            this.decayAlpha *= 0.975;
            ctx.save();
            ctx.beginPath();
            // ctx.translate(this.x + cos(this.rotation * this.speed) * 250, this.y);
            // ctx.rotate(this.rotation);
            // ctx.scale(this.smoothedScale * this.level, this.smoothedScale * this.level);
            // ctx.moveTo(this.size * 0.5, 0);
            // ctx.lineTo(this.size * -0.5, 0);
            ctx.arc(this.x,this.y,this.smoothedScale,0,2*Math.PI)
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.globalAlpha = this.smoothedAlpha / this.level;
            ctx.strokeStyle = this.color;
            ctx.stroke();
            return ctx.restore();
        };

        return Particle;

    })();

    Sketch.create({
        particles: [],
        setup: function() {
            var analyser, error, i, intro, j, particle, ref, warning, x, y;
            for (i = j = 0, ref = NUM_PARTICLES - 1; j <= ref; i = j += 1) {
                x = random(this.width);
                y = random(this.height * 2);
                particle = new Particle(x, y);
                particle.energy = random(particle.band / 256);
                this.particles.push(particle);
            }
            if (AudioAnalyser.enabled) {
                try {
                    analyser = new AudioAnalyser(MP3_PATH, NUM_BANDS, SMOOTHING);
                    analyser.onUpdate = (function(_this) {
                        return function(bands) {
                            var k, len, ref1, results;
                            ref1 = _this.particles;
                            results = [];
                            for (k = 0, len = ref1.length; k < len; k++) {
                                particle = ref1[k];
                                results.push(particle.energy = bands[particle.band] / 256);
                            }
                            return results;
                        };
                    })(this);
                    //analyser.start();
                    $(".sketch").addClass("hidden");
                    globvars.analyser = analyser;
                    globvars.sketch = $(".sketch");
                    document.body.appendChild(analyser.audio);
                } catch (error1) {
                    error = error1;
                }
            }
        },
        draw: function() {
            var j, len, particle, ref, results;
            this.globalCompositeOperation = 'lighter';
            ref = this.particles;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
                particle = ref[j];
                if (particle.y < -particle.size * particle.level * particle.scale * 2) {
                    particle.reset();
                    particle.x = random(this.width);
                    particle.y = this.height + particle.size * particle.scale * particle.level;
                }
                particle.move();
                results.push(particle.draw(this));
            }
            return results;
        }
    });

}).call(this);

globvars.play = function () {
    globvars.analyser.start();
    var intID = setInterval(function () {
        if (globvars.analyser.audio.volume >= 0.99) {
            clearInterval(intID);
            $("div.swagbox").addClass("transparant");
            globvars.sketch.removeClass("hidden");
        }
        else
            globvars.analyser.audio.volume += 0.03;
    }, 10);
};

globvars.pause = function () {
    var intID = setInterval(function () {
        if (globvars.analyser.audio.volume <= 0.04) {
            clearInterval(intID);
            globvars.analyser.stop();
        }
        else
            globvars.analyser.audio.volume -= 0.03;
    }, 10);
    $("div.swagbox").removeClass("transparant");
    globvars.sketch.addClass("hidden");

};

globvars.playing = false;

$(function () {
    globvars.analyser.audio.volume = 0;
    $("#easteregg").click(function () {
        console.log("hi");
        if (globvars.playing) {
            globvars.pause();
        }
        else {
            globvars.play();
        }
        globvars.playing = !globvars.playing;
    })
})
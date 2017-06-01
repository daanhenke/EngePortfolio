Viz = function (audioElement, canvasElement, options) {
    var self = {};

    self.resolveAudioElement = function (audioElement) {
        if (typeof audioElement === "string") {
            self.audioElement = new Audio();
            self.audioElement.crossOrigin = "anonymous";
            self.audioElement.src = audioElement;
        }
        else {
            self.audioElement = audioElement;
        }
    };

    self.resolveCanvasElement = function (canvasElement) {
        if (typeof canvasElement === "undefined") {
            self.canvasElement = document.createElement("canvas");
            self.canvasElement.width = window.innerWidth;
            self.canvasElement.height = window.innerHeight;
            self.canvasElement.style.opacity = 0;
        }
        else {
            self.canvasElement = canvasElement;
        }
    };

    self.getAudioElement = function () {
        return self.audioElement;
    };

    self.getCanvasElement = function () {
        return self.canvasElement;
    };

    self.smoothID = undefined;

    self.smoothPlay = function () {
        if (self.smoothID !== undefined) {
            clearInterval(self.smoothID);
        }

        self.audioElement.play();

        self.audioElement.volume = 0;
        self.canvasElement.style.opacity = 0;
        var volume = 0;
        var opacity = 0;
        var increment = (self.options.volume / self.options.smoothSteps);
        var opacityInc = (1 / self.options.smoothSteps);

        self.smoothID = setInterval(function () {
            volume += increment;
            opacity += opacityInc;
            if (volume > self.options.volume) {
                volume = self.options.volume;
                clearInterval(self.smoothID);
                self.smoothID = undefined;
                self.canvasElement.style.opacity = 1;
            }
            if (opacity > 1) {
                opacity = 1;
            }
            self.canvasElement.style.opacity = opacity;
            self.audioElement.volume = volume;
        }, self.options.smoothTime / self.options.smoothSteps);
    };

    self.smoothMute = function () {
        if (self.smoothID !== undefined) {
            clearInterval(self.smoothID);
        }

        self.audioElement.volume = self.options.volume;
        self.canvasElement.style.opacity = 1;
        var opacity = 1;
        var volume = self.options.volume;
        var decrement = (self.options.volume / self.options.smoothSteps);
        var opacityDec = (1 / self.options.smoothSteps);

        self.smoothID = setInterval(function () {
            volume -= decrement;
            opacity -= opacityDec;
            if (volume < 0) {
                volume = 0;
                clearInterval(self.smoothID);
                self.smoothID = undefined;
                self.canvasElement.style.opacity = 0;
                self.audioElement.pause();
            }
            if (opacity < 0)
                opacity = 0;
            self.canvasElement.style.opacity = opacity;
            self.audioElement.volume = volume;
        }, self.options.smoothTime / self.options.smoothSteps);
    };

    self.getFrame = function () {
        self.analyser.getByteFrequencyData(self.frequencyData);
        return self.frequencyData;
    };

    self.tick = function () {
        self.visualizer.ontick(self);
    };

    self.getOption = function (option, defaultValue) {
        if (self.options.visualizer_options.hasOwnProperty(option))
            return self.options.visualizer_options[option];
        else
            return defaultValue;
    };

    self.getCanvasWidth = function () {
        return self.canvasElement.width;
    };

    self.getCanvasHeight = function () {
        return self.canvasElement.height;
    };

    self.clearCanvas = function () {
        self.canvasContext.clearRect(0, 0, self.getCanvasWidth(), self.getCanvasHeight());
    };

    self.randomRange = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    self.drawCircle = function (x, y, radius, style, fill) {
        var updateCode = undefined;
        if (fill || fill === undefined)
            self.canvasContext.fillStyle = style;
        else
            self.canvasContext.strokeStyle = style;
        self.canvasContext.beginPath();
        self.canvasContext.arc(x, y, radius, 0, 2 * Math.PI, false);

        if (fill || fill === undefined)
            self.canvasContext.fill();
        else
            self.canvasContext.stroke();
    };

    self.resizeCanvas = function () {
        self.canvasElement.width = window.innerWidth;
        self.canvasElement.height = window.innerHeight;
    };

    if (options === undefined) options = {};

    self.options = {
        autoplay: options.autoplay || false,
        volume: options.volume || 0.3,
        smoothTime: options.smoothTime || 300,
        smoothSteps: options.smoothSteps || 10,

        chosenVisualizer: options.chosenVisualizer || "bars",
        renderMethod: options.renderMethod || "interval",

        visualizer_options: options.visualizer_options || {}
    };

    console.log(self.options);

    self.audioContext = new AudioContext();

    self.resolveAudioElement(audioElement);
    self.audioElement.addEventListener('canplay', function () {
        self.audioSource = self.audioContext.createMediaElementSource(self.audioElement);
        self.analyser = self.audioContext.createAnalyser();

        self.frequencyData = new Uint8Array(self.analyser.frequencyBinCount);

        self.audioSource.connect(self.analyser);
        self.audioSource.connect(self.audioContext.destination);
        self.analyser.connect(self.audioContext.destination);

        if (self.options.renderMethod === "interval") {
            setInterval(function () {
                self.tick();
            }, 1000/60);
        }
        else if (self.options.renderMethod === "animation") {
            var i = function () {
                requestAnimationFrame(i);
                self.tick();
            };
            i();
        }

        self.visualizer = VizUtils.visualizers[self.options.chosenVisualizer]();
        self.visualizer.onstart(self);

        if (self.options.autoplay)
            self.smoothPlay();
    });

    self.resolveCanvasElement(canvasElement);
    self.canvasContext = self.canvasElement.getContext("2d");

    return self;
};

var VizUtils = {
    visualizers: {},

    appendVisualizer: function (name, visualizer) {
        if (!VizUtils.visualizers.hasOwnProperty(name))
            VizUtils.visualizers[name] = visualizer;
    },

    removeVisualizer: function (name) {
        if (VizUtils.visualizers.hasOwnProperty(name))
            delete VizUtils.visualizers[name];
    }
}
var Bubble = function (x, y, baseRadius, baseSwing, baseSpeed, colour, audioIndex, audioWidth, sensitivity) {
    var self = {};

    self.x = x;
    self.y = y;

    self.baseX = x;

    self.baseRadius = baseRadius;
    self.baseSwing = baseSwing;
    self.baseSpeed = baseSpeed;

    self.colour = colour;

    self.audioIndex = audioIndex;
    self.audioWidth = audioWidth;

    self.sensitivity = sensitivity;

    self.draw = function (viz, frameData, bubbles) {
        var amplitude = 0;

        for (var i = 0; i < self.audioWidth; i++) {
            amplitude += frameData[self.audioIndex + i];
        }

        amplitude = Math.floor(amplitude / self.audioWidth);
        //console.log(Math.floor(self.baseRadius * (amplitude / 256)));
        viz.canvasContext.lineWidth = 4;

        self.currentRadius = Math.floor(self.baseRadius * (0.5 + (amplitude / 256))) * self.sensitivity

        viz.drawCircle(self.x, self.y, self.currentRadius, self.colour, false);

        self.y -= self.baseSpeed;
        self.x = self.baseX + Math.sin(self.y / 40) * self.baseSwing;

        if (self.y < 0 - self.baseRadius * 3)
            bubbles.splice(bubbles.indexOf(self), 1);
    };
    /*
     self.generateLocation = function (bubbles) {
     var id = setInterval(function () {
     var x = viz.randomRange(0, viz.getCanvasWidth());
     var y = viz.getCanvasHeight() + baseRadius;

     for (var i = 0; i < bubbles.length; i++) {
     var other = bubbles[i];

     if (other.x === self.x && other.y === self.y)
     continue;

     var distance = Math.sqrt(
     ((x - other.x) * (x - other.x))
     + ((y - other.y) * (y - other.y))
     );
     if (distance > self.currentRadius + other.currentRadius) {
     clearInterval(id);
     self.x = x;
     self.y = y;

     console.log("ENGE DINGE")
     }
     }
     }, 10)
     };
     */

    return self;
};
var VizBubbles = function () {
    var self = {};

    self.onstart = function (viz) {
        self.viz = viz;
        self.bubbles = [];
        self.max_bubbles = self.viz.getOption("bubbles", 30);
        self.colours = self.viz.getOption("colours", ["#db2d20", "#e8bbd0", "#fded02", "#01a252", "#b5e4f4", "#01a0e4", "#a16a94", "#cdab53"]);
        self.interval = self.viz.getOption("interval", 500);
        setInterval(self.createBubble, self.interval);
    };

    self.ontick = function () {
        var freqData = self.viz.getFrame();

        self.viz.clearCanvas();

        for (var i = 0; i < self.bubbles.length; i++) {
            self.bubbles[i].draw(viz, freqData, self.bubbles);
        }
    };

    self.createBubble = function () {

        var baseRadius = viz.randomRange(20, 100);

        var x = viz.randomRange(0, viz.getCanvasWidth());
        var y = viz.getCanvasHeight() + baseRadius * 3;

        for (var i = 0; i < self.bubbles.length; i++) {
            var other = self.bubbles[i];
            if (Math.abs(x - other.x) <= baseRadius + other.baseRadius && Math.abs(y - other.y) < self.viz.getCanvasHeight() / 2) {
                return;
            }
        }

        var baseSwing = viz.randomRange(0, 2000) / 100;
        var baseSpeed = viz.randomRange(700, 1200) / 1000;

        var colour = self.colours[viz.randomRange(0, self.colours.length - 1)];

        var audioWidth = viz.randomRange(5, 30);
        var audioIndex = viz.randomRange(0, viz.frequencyData.length - audioWidth - 1);

        var sensitivity = 2;

        self.bubbles.push(Bubble(x, y, baseRadius, baseSwing, baseSpeed, colour, audioIndex, audioWidth, sensitivity));
    };

    self.checkCollision = function (one, two) {
        var dx = one.x - two.x;
        var dy = two.x - two.y;

        return Math.sqrt(dx * dx + dy * dy) < (one.baseRadius * 1.5) + (two.baseRadius * 1.5);
    };

    return self;
};

VizUtils.appendVisualizer("bubbles", VizBubbles);
var VizBars = function () {
    var self = {}

    self.onstart = function (viz) {
        self.bars = 40;
        self.yScale = 3;
        self.bar_length = Math.ceil(viz.frequencyData.length / 40);

        self.width = viz.canvasElement.width / self.bars;

        viz.canvasContext.fillStyle = "#30ee78";
    };

    self.ontick = function (viz) {
        var frameData = viz.getFrame();

        viz.canvasContext.clearRect(0, 0, viz.canvasElement.width, viz.canvasElement.height);

        for (var i = 0; i < self.bars; i++) {
            var frame = 0;
            for (var j = 0; j < self.bar_length; j++) {
                frame += frameData[i * self.bar_length + j];
            }
            frame = Math.floor(frame / self.bar_length);
            viz.canvasContext.fillRect(i * self.width, viz.canvasElement.height - (frame * self.yScale), self.width - 3, frame * self.yScale);
        }
    };

    return self;
};

VizUtils.appendVisualizer("bars", VizBars);
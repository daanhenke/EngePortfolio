var Viz_Bars = {};

Viz_Bars.onstart = function (viz) {
    Viz_Bars.bars = 40;
    Viz_Bars.yScale = 3;
    Viz_Bars.bar_length = Math.ceil(viz.frequencyData.length / 40);

    Viz_Bars.width = viz.canvasElement.width / Viz_Bars.bars;

    viz.canvasContext.fillStyle = "#30ee78";
};

Viz_Bars.ontick = function (viz) {
    var frameData = viz.getFrame();

    viz.canvasContext.clearRect(0, 0, viz.canvasElement.width, viz.canvasElement.height);

    for (var i = 0; i < Viz_Bars.bars; i++) {
        var frame = 0;
        for (var j = 0; j < Viz_Bars.bar_length; j++) {
            frame += frameData[i * Viz_Bars.bar_length + j];
        }
        frame = Math.floor(frame / Viz_Bars.bar_length);
        viz.canvasContext.fillRect(i * Viz_Bars.width, viz.canvasElement.height - (frame * Viz_Bars.yScale), Viz_Bars.width - 3, frame * Viz_Bars.yScale);
    }
};

VizUtils.appendVisualizer("bars", Viz_Bars);
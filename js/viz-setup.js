var viz;
window.onload = function () {
    viz = Viz("mp3/bg.mp3", undefined, {
        autoplay: true,
        chosenVisualizer: "bubbles",
        smoothTime: 5000,
        visualizer_options: {
            bubbles: 10,
            colours: ["#b037b9", "#e5a3eb", "#96a6b6", "#6c869e", "#548942"],
            interval: 2000
        }
    });

    var canvas = viz.getCanvasElement();

    viz.getAudioElement().repeat = true;

    window.onresize = function () {
        viz.resizeCanvas();
    };

    $("body").append(canvas);
    document.body.appendChild(viz.getAudioElement());

};
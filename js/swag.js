$(function () {
    $(".swagbar").each(function (i, element) {
        var name = $(element).attr("data-name");
        var percentage = $(element).attr("data-percentage");

        var nameDiv = $('<div class="swagbar-name"></div>');

        nameDiv.text(name);

        var percentageDiv = $('<div class="swagbar-percentage"></div>');

        $(element).append(nameDiv);
        $(element).append(percentageDiv);

        $(percentageDiv).animate({
            width: percentage
        }, 6000);
    })
});
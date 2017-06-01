var whatami = whatami || {};

whatami.element = "#whatami";
whatami.sentences = [
    "a professional web developer",
    "a fast worker",
    "a student",
    "a geek",
    "a goon spotter a matskees"
];

whatami.init = function () {
    Typed.new(whatami.element, {
        strings: whatami.sentences,
        typeSpeed: 15,
        backSpeed: 2,
        loop: true,
        backDelay: 4000,
        shuffle: true
    });
};

$(whatami.init);
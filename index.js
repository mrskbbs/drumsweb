import common_rythms_module from "./scripts/webcomponents/exercises/rhythms.js";
import { StaveComponent } from "./scripts/webcomponents/stave/stave.js";
import { Player } from "./scripts/player.js";

const player = new Player();
Tone.start();

const common_rythms_template = document.querySelector("#common_rythms_template");
const common_rythms = new StaveComponent(
    "common_rythms",
    player,
    common_rythms_module.generateNotes(common_rythms_module.patterns[11]),
    "16n",
);
common_rythms_template.replaceWith(common_rythms);

const common_rythms_template1 = document.querySelector("#common_rythms_template1");
const common_rythms1 = new StaveComponent(
    "common_rythms1",
    player,
    common_rythms_module.generateNotes(common_rythms_module.patterns[3]),
    "16n",
);
common_rythms_template1.replaceWith(common_rythms1);

import { slidersProgressFix } from "/assets/utils.js";
import { Player } from "/assets/core/player.js";
import { RhythmExerciseWebcomponent } from "/assets/exercises/rhythm.js";
import { StickingExerciseWebcomponent} from "/assets/exercises/sticking.js";

const player = new Player();

const rhythms_template = document.querySelector("#rhythms_template");
const rhythms = new RhythmExerciseWebcomponent(player);
rhythms_template.replaceWith(rhythms);

const sticking_template = document.querySelector("#sticking_template");
const sticking = new StickingExerciseWebcomponent(player);
sticking_template.replaceWith(sticking);

Tone.start();

slidersProgressFix();

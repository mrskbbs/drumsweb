import { Player } from "/scripts/core/player.js";
import { RhythmExerciseWebcomponent } from "/scripts/exercises/rhytm.js";

const player = new Player();

const rhythms_template = document.querySelector("#rhythms_template");
const rhythms = new RhythmExerciseWebcomponent(player);
rhythms_template.replaceWith(rhythms);

const rhythms_template1 = document.querySelector("#rhythms_template1");
const rhythms1 = new RhythmExerciseWebcomponent(player);
rhythms_template1.replaceWith(rhythms1);

Tone.start();

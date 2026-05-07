/*
A base class for all the pattern based exercises where 
you generate patterns and notes (manually, procedurally) that
you can select in stave controls
*/

import { Exercise } from "/scripts/core/exercise.js";
import { StaveRenderer } from "/scripts/stave/stave_render.js";
import { StaveControls } from "/scripts/stave/stave_controls.js";
import { StaveSound } from "/scripts/stave/stave_sound.js";

export class PatternExerciseBase extends Exercise { 
    renderer;
    sound;
    controls;
    player;
    notes;
    patterns;

    constructor(player){
        super();
        this.player = player;
        this.player.subscribe(this);

        this.patterns = new Map();
        this.notes = new Map();
    }

    notify(sender, event, value){
        switch(sender.constructor){
            case StaveRenderer:
                this.rendererHandleEvent(event, value);
                break;
            case StaveSound:
                this.soundHandleEvent(event, value);
                break;
            case StaveControls:
                this.controlsHandleEvent(event, value);
                break;
            default:
                throw new Error("Invalid sender type");
        }
    }

    rendererHandleEvent(event, value){
        switch(event){
            default:
                throw new Error("Invalid event for renderer");
        }
    }

    controlsHandleEvent(event, value){
        switch(event){
            case "bpm":
                const bpm = Number(value);
                this.renderer.cursorSpeed(bpm);
                this.player.setBPM(this, bpm);
                break;
            case "play":
                this.sound.play();
                break;
            case "stop":
                this.sound.stop();
                break;
            case "loop_count":
                this.sound.loop_count = Number(value);
                break;
            case "autoplay":
                this.sound.autoplay_on = Boolean(value);
                break;
            case "metronome":
                this.sound.metronome_volume = Number(value);
                break;
            case "drums":
                this.sound.drums_volume = Number(value);
                break;
            case "pattern":
                this.renderer.changeNotes(value);
                this.sound.changeNotes(value);
                break;
            default:
                throw new Error("Invalid event for controls");
        }
    }

    soundHandleEvent(event, value){
        switch(event){
            case "play":
                this.player.play(this, this.controls.bpm);
                this.controls.is_playing = true;
                break;
            case "stop":
                this.player.stop(this);
                this.controls.is_playing = false;
                break;
            case "cursor_move":
                this.renderer.cursorMove(value);
                break;
            case "next_note":
                this.controls.note_ind = Number(value);
                this.renderer.changeNotes(value);
                break;
            default:
                throw new Error("Invalid event for sound");
        }
    }

    generateNotes(){
        throw new Error("Method must be defined");
    }
}

const template = document.createElement("template");
template.innerHTML = 
`
<div>
    <template id="renderer_tmpl"></template>
    <template id="controls_tmpl"></template>
</div>
`;

export class PatternExerciseBaseWebcomponent extends HTMLElement{
    exercise;

    constructor(player, ExerciseClass){
        super();

        this.innerHTML = template.innerHTML; 

        this.exercise = new ExerciseClass(player); 
        this.exercise.generateNotes();
    }

    connectedCallback(){
        this.exercise.renderer = new StaveRenderer(
            this.exercise,
            4,
            4,
            Tone.Transport.bpm.value,
            0,
        );
        this.exercise.sound = new StaveSound(this.exercise, 16, 4);
        this.exercise.controls = new StaveControls(
            this.exercise,
            this.exercise.notes.keys().map(
                (v, i) => new Object({ text: v, value: i })
            ).toArray(),
        );

        this.querySelector("#renderer_tmpl")
            .replaceWith(this.exercise.renderer);
        this.querySelector("#controls_tmpl")
            .replaceWith(this.exercise.controls);
    }
}

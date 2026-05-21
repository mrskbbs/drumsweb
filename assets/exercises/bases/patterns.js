/*
A base class for all the pattern based exercises where 
you generate patterns and notes (manually, procedurally) that
you can select in stave controls
*/

import { Exercise } from "/assets/core/exercise.js";
import { StaveRenderer } from "/assets/stave/render.js";
import { StaveControls } from "/assets/stave/controls.js";
import { StaveSound } from "/assets/stave/sound.js";

export class PatternExerciseBase extends Exercise { 
    renderer;
    sound;
    controls;
    player;
    notes;
    patterns;

    constructor(player, options){
        super();
        this.player = player;
        this.player.subscribe(this);

        this.options = options;
        this.notes = new Map();
        this.notes_list = [];
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
<div class="patterns_inner">
    <template id="renderer_tmpl"></template>
    <template id="controls_tmpl"></template>
</div>
`;

export class PatternExerciseBaseWebcomponent extends HTMLElement{
    exercise;
    
    constructor(player, ExerciseClass, options){
        /*
        Options syntax:
            {
                num_beats: Number,
                beat_value: Number, // these two represent time signature like this: num_beats/beat_value
                sequence_measure: Number,
                metronome_measure: Number, // these two represent note duration 1/sequence_measure (i.e. 1/8, 1/16 etc.)
            }
        */
        super();

        this.innerHTML = template.innerHTML; 
        this.options = options;
        this.exercise = new ExerciseClass(player, options); 
        this.exercise.generateNotes();
    }

    connectedCallback(){
        this.exercise.renderer = new StaveRenderer(
            this.exercise,
            this.options.num_beats,
            this.options.beat_value,
            Tone.Transport.bpm.value,
            0,
        );
        this.exercise.sound = new StaveSound(
            this.exercise, 
            this.options.sequence_measure, 
            this.options.metronome_measure,
        );
        this.exercise.controls = new StaveControls(
            this.exercise,
            this.exercise.notes_list.map(
                (v, i) => new Object({ text: v, value: i })
            ),
        );

        this.querySelector("#renderer_tmpl")
            .replaceWith(this.exercise.renderer);
        this.querySelector("#controls_tmpl")
            .replaceWith(this.exercise.controls);
    }
}

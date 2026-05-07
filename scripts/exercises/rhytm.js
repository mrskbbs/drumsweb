import { Exercise } from "/scripts/core/exercise.js";
import { StaveRenderer } from "/scripts/stave/stave_render.js";
import { StaveControls } from "/scripts/stave/stave_controls.js";
import { StaveSound } from "/scripts/stave/stave_sound.js";

class RhythmExercise extends Exercise { 
    renderer;
    sound;
    controls;
    player;
    notes = [];
    patterns = [];

    constructor(player){
        super();
        this.player = player;
        this.player.subscribe(this);
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

    generatePatternsAndNotes(){
        /* 
           procedural generation of patterns 
           true - snare
           false - rest note
           we need all combinations for four notes, and we have two options -> 2^4
        */
        for(let i = 1; i < Math.pow(2, 4); i++){
            // little bitwise op magic
            this.patterns.push([
                Boolean(i & 1), // 1st rightmost bit is 1?
                Boolean(i & 2), // 2nd rightmost bit is 2? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ]);

            this.notes.push(this.createNote([
                Boolean(i & 1), // 1st rightmost bit is 1?
                Boolean(i & 2), // 2nd rightmost bit is 2? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ]));
        }
    }

    createNote(pattern){
        const counts = [1, "e", "&", "a"];

        return [].concat(pattern, pattern, pattern, pattern)
            .map(
                (v, i) => {
                    const note = v 
                        ? new Vex.Flow.StaveNote({clef: "percussion", keys: ["c/5"], duration: "16"}) 
                        : new Vex.Flow.StaveNote({keys: ["c/5"], duration: "16r"});

                    note.addModifier(
                        0,
                        new Vex.Flow.Annotation(String(counts[i % 4]))
                          .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP)
                          .setJustification(Vex.Flow.Annotation.Justify.CENTER),
                    );

                    if (v) {
                        note.addModifier(
                            0,
                            new Vex.Flow.Annotation(i % 2 == 0 ? "R" : "L")
                              .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM)
                              .setJustification(Vex.Flow.Annotation.Justify.CENTER),
                        );        
                    }

                    if(i % 4 === 0) counts[0] += 1;

                    return note;
                }
            );
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

export class RhythmExerciseWebcomponent extends HTMLElement{
    exercise;

    constructor(player){
        super();

        this.innerHTML = template.innerHTML; 

        this.exercise = new RhythmExercise(player); 
        this.exercise.generatePatternsAndNotes();
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
            //TODO: there is gotta be a better way, but im too tired to think on how to improve it 
            this.exercise.patterns.map((p, i) => {
                const counts = ["1", "e", "&", "a"];
                const res = [];
                for(let i = 0; i < p.length; i++){
                    if (p[i]) res.push(counts[i]);
                }

                return {
                    text: res.join(),
                    value: i,
                };
            })
        );

        this.querySelector("#renderer_tmpl")
            .replaceWith(this.exercise.renderer);
        this.querySelector("#controls_tmpl")
            .replaceWith(this.exercise.controls);
    }
}

customElements.define("rhythm-exercise", RhythmExerciseWebcomponent);

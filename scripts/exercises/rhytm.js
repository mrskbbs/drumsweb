// class RythmExerciseComponent extends HTMLElement{
//     exercise;
//
//     constructor(ExerciseClass, template){
//         super();
//
//         this.shadow = this.attachShadow({ mode: "open" });
//         this.shadow.append(template.content.cloneNode(true));
//
//         this.exercise = new ExerciseClass();
//     }
// }

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

    constructor(){
        super();
        // this.player = player;
        //
        // this.player.subscribe(this);
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
                const bpm = Number(bpm);
                this.exercise.renderer.cursorSpeed(bpm);
                this.sound.rescheduleNextTrack();
                this.player.notify(this, "bpm", bpm)
                break;
            case "play":
                this.exercise.sound.play();
                this.player.notify(this, "play");
                break;
            case "stop":
                this.exercise.sound.stop();
                this.player.notify(this, "stop");
                break;
            // TODO: after mvp add this functionality
            // case "autoplay":
            //     this.exercise.sound.autoplay_on = Boolean(value);
            //     break;
            // case "metronome_on":
            //     this.exercise.sound.metronome_on = Boolean(value);
            //     break;
            case "change_notes":
                this.exercise.renderer.changeNotes(value);
                this.exercise.sound.changeNotes(value);
                break;
            // case "countdown":
            //     this.exercise.sound.countdown_on = Boolean(value);
            //     break;
            // case "loop_count":
            //     this.exercise.sound.loop_count = Number(value);
            //     break;
            default:
                throw new Error("Invalid event for controls");
        }
    }

    soundHandleEvent(event, value){
        switch(event){
            case "cursor_move":
                this.exercise.renderer.cursorMove(value);
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
    <div>
        Controls
        <template id="controls_tmpl"></template>
    </div>
    <template id="renderer_tmpl"></template>
</div>
`;

class RhythmExerciseWebcomponent extends HTMLElement{
    exercise;

    constructor(){
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));

        this.exercise = new RhythmExercise();
    }

    connectedCallback(){
        this.exercise.renderer = new StaveRenderer(
            this.exercise,
            4,
            4,
            Tone.Transport.bpm.value,
            0,
        );
        this.exercise.sound = new StaveSound(this.exercise, 16);
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

        this.shadow.querySelector("#renderer_tmpl")
            .replaceWith(this.exercise.renderer);
        this.shadow.querySelector("#controls_tmpl")
            .replaceWith(this.exercise.controls);
    }
}
customElements.define("rhythm-exercise", RhythmExerciseWebcomponent);



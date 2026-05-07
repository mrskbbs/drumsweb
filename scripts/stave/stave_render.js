import { ExerciseWebcomponent } from "/scripts/core/exercise_component.js";

const template = document.createElement("template");
template.innerHTML =  
`
<link rel="stylesheet" href="scripts/stave/stave.css">
<div id="stave_canvas">
    <div class="pos_block"></div>
</div>
`;

export class StaveRenderer extends ExerciseWebcomponent {
    stave_canvas;
    pos_block;
    #num_beats;
    #beat_value;
    #bpm;
    #note;

    constructor(exercise, num_beats, beat_value, bpm, note_ind){
        super(exercise);
        this.innerHTML = template.innerHTML;
        
        // Init info for renderer
        this.#num_beats = num_beats;
        this.#beat_value = beat_value;
        this.#bpm = bpm;
        this.#note = this.exercise.notes[note_ind];
    }

    connectedCallback(){
        this.stave_canvas = this.querySelector("#stave_canvas");
        this.pos_block = this.querySelector("#stave_canvas > .pos_block");

        this.#render();
    }
    
    changeNotes(ind){
        this.#note = this.exercise.notes[ind];

        this.#render();
    }

    cursorSpeed(bpm){
        // insane hack
        const duration = ((60 / bpm) * 100) + ((60 / bpm) * 100)*(1/5);
        this.pos_block.style.transitionDuration = `${duration}ms`;    
    }

    cursorMove(bb){
        this.pos_block.style.width = `${bb.width+50}px`;
        this.pos_block.style.transform = `translateX(${bb.x}px)`;
    }

    #render(){
        const old_stave = this.stave_canvas.querySelector("svg");
        if(old_stave) this.stave_canvas.removeChild(old_stave);

        const renderer = new Vex.Flow.Renderer(
            this.stave_canvas,
            Vex.Flow.Renderer.Backends.SVG,
        );
        renderer.resize(1000, 250);

        const context = renderer.getContext();

        const stave = new Vex.Flow.Stave(10, 40, 500);
        stave.addClef("percussion").addTimeSignature(
            `${this.#num_beats}/${this.#beat_value}`
        );

        const voice = new Vex.Flow.Voice({ 
            numBeats: this.#num_beats, 
            beatValue: this.#beat_value,
        });

        voice.addTickables(this.#note);

        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 400);

        context.scale(1.5, 1.5);
        voice.draw(context, stave);
        stave.setContext(context).draw();

        this.cursorSpeed(this.#bpm);
        this.cursorMove({ x: this.#note[0].getAbsoluteX() * 1.5 });
    }
}

window.customElements.define("stave-render", StaveRenderer);

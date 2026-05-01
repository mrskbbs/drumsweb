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
        
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));
        
        // Init info for renderer
        this.#num_beats = num_beats;
        this.#beat_value = beat_value;
        this.#bpm = bpm;
        this.#note = this.exercise.notes[note_ind];
    }

    connectedCallback(){
        this.stave_canvas = this.shadow.querySelector("#stave_canvas");
        this.pos_block = this.shadow.querySelector("#stave_canvas > .pos_block");

        this.#render();
    }
    
    changeNotes(ind){
        this.#note = this.exercise.notes[ind];

        this.#render();
    }

    cursorSpeed(bpm){
        const duration = ((60 / bpm) * 100) * 0.6;
        // const duration = 100;
        this.pos_block.style.transitionDuration = `${duration}ms`;    
    }

    cursorMove(bb){
        this.pos_block.style.width = `${bb.width}px`;
        this.pos_block.style.transform = `translateX(${bb.x}px)`;
    }

    #render(){
        const renderer = new Vex.Flow.Renderer(
            this.stave_canvas,
            Vex.Flow.Renderer.Backends.SVG,
        );
        renderer.resize(500, 150);

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

        voice.draw(context, stave);
        stave.setContext(context).draw();

        this.cursorSpeed(this.#bpm);
        this.cursorMove(this.#note[0].getBoundingBox());
    }
}

window.customElements.define("stave-render", StaveRenderer);

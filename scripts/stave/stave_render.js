const template = document.createElement("template");
template.innerHTML =  
`
<link rel="stylesheet" href="scripts/stave/stave.css">
<div id="stave_canvas">
    <div class="pos_block"></div>
</div>
`;

class StaveRendererWebcomponent extends HTMLElement {
    stave_canvas;
    pos_block;
    #num_beats;
    #beat_value;
    #bpm;
    #notes;

    constructor(num_beats, beat_value, bpm, notes){
        super();
        
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));
        
        // Init info for renderer
        this.#num_beats = num_beats;
        this.#beat_value = beat_value;
        this.#bpm = bpm;
        this.#notes = notes;
    }

    connectedCallback(){
        this.stave_canvas = this.shadow.querySelector("#stave_canvas");
        this.pos_block = this.shadow.querySelector("#stave_canvas > .pos_block");

        this.#render();
    }
    
    notesChange(notes){
        this.#notes = notes;

        this.#render();
    }

    cursorSpeed(bpm){
        const duration = ((60 / bpm) * 1000) * 0.6;
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
            `${this.num_beats}/${this.beat_value}`
        );

        const voice = new Vex.Flow.Voice({ 
            numBeats: this.#num_beats, 
            beatValue: this.#beat_value,
        });

        voice.addTickables(this.#notes);

        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 400);

        voice.draw(context, stave);
        stave.setContext(context).draw();

        this.cursorSpeed(this.#bpm);
        this.cursorMove(this.#notes[0].getBoundingBox());
    }
}

class StaveRenderer extends ExerciseComponent {
    webcomponent;
    cursorMove;
    cursorSpeed;
    notesChange;

    constructor(exercise){
        super(exercise);
        this.webcomponent = new StaveRendererWebcomponent();
        this.cursorMove = this.webcomponent.cursorMove;
        this.cursorSpeed = this.webcomponent.cursorSpeed;
        this.notesChange = this.webcomponent.notesChange;
    }
}

import { blockTransitionDuration } from "/scripts/utils.js";

const template = document.createElement("template");
template.innerHTML = 
`
<link rel="stylesheet" href="scripts/webcomponents/stave/stave.css">
<div>
    <span>
        <p>BPM:</p>
        <p id="bpm_display"></p>
        <button id="btn_play">Play</button>
    </span>
    <input id="bpm_input" type="range" min="30" max="250" step="1.0"/>
    <div id="stave_canvas">
        <div class="pos_block"></div>
    </div>
</div>
`;

export class StaveComponent extends HTMLElement { 
    constructor(id, player, notes, measure, num_beats = 4, beat_value = 4){
        super();
        
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));

        this.id = id;
        this.player = player;
        this.notes = notes;
        this.num_beats = num_beats;
        this.beat_value = beat_value;
        this.measure = measure;

        this.note_ind = 0;
        this.is_playing = false;
    }

    connectedCallback(){
        this.selectElements();
        this.setupNotationRenderer();
        this.setupBPMInput();
        this.setupPlayButton();
    }

    selectElements(){
        this.bpm_input = this.shadow.querySelector("#bpm_input");
        this.bpm_display = this.shadow.querySelector("#bpm_display");
        this.btn_play= this.shadow.querySelector("#btn_play");
        this.stave_canvas = this.shadow.querySelector("#stave_canvas");
        this.pos_block = this.shadow.querySelector("#stave_canvas > .pos_block");
    }

    setupBPMInput(){
        this.bpm = Number(this.bpm_input.value);
        this.bpm_display.innerHTML = `${this.bpm}`;

        this.bpm_input.addEventListener("input", (e) => {
            this.bpm = Number(e.currentTarget.value);
            this.bpm_display.innerHTML = `${this.bpm}`;
            if (this.id === this.player.track?.id) this.player.bpm = this.bpm;

            // Smooth transition
            this.pos_block.style.transitionDuration = `${
                blockTransitionDuration(this.bpm, Number(this.bpm_input.min))
            }ms`;
        });
    }

    setupPlayButton(){
        this.btn_play.addEventListener("click", (e) => {
            this.is_playing = !this.is_playing;
            e.currentTarget.textContent = this.is_playing ? "Stop" : "Play";

            if (this.is_playing){
                this.note_ind = 0;

                this.player.bpm = this.bpm;
                this.player.changeTrack(this.track);
                this.player.start();
            } else{
                this.player.stop();
            }
        });
    }

    setupNotationRenderer(){
        const renderer = new Vex.Flow.Renderer(
            this.stave_canvas,
            Vex.Flow.Renderer.Backends.SVG
        );
        renderer.resize(500, 150);

        const context = renderer.getContext();

        const stave = new Vex.Flow.Stave(10, 40, 500);
        stave.addClef("percussion").addTimeSignature(
            `${this.num_beats}/${this.beat_value}`
        );

        const voice = new Vex.Flow.Voice({ 
            numBeats: this.num_beats, 
            beatValue: this.beat_value,
        });

        voice.addTickables(this.notes);

        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 400);

        voice.draw(context, stave);
        stave.setContext(context).draw();

        this.pos_block.style.transitionDuration = `${
            blockTransitionDuration(this.bpm, Number(this.bpm_input.min))
        }ms`;
        this.posBlockTransform(0);
    }

    posBlockTransform(ind){
        const bb = this.notes[ind | this.note_ind].getBoundingBox();
        this.pos_block.style.width = `${bb.width}px`;
        this.pos_block.style.transform = `translateX(${bb.x}px)`;
    }

    get track(){
        return {
            id: this.id, 
            notes: this.notes, // array of VexFlow note objects
            metronome: {
                measure: "4n",
            },
            sequence: {
                callback: () => {
                    this.posBlockTransform();

                    this.note_ind++;
                    if(this.note_ind >= this.notes.length) 
                        this.note_ind = 0;
                },
                measure: this.measure,
            },
            stop_callback: () => {
                this.btn_play.textContent = "Play";
                this.is_playing = false;
            },
        };
    }
}

customElements.define("drum-stave", StaveComponent);

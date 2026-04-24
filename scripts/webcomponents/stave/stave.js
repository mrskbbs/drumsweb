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

// <style>
// #stave_canvas{
//     position: relative;
// }
//
// .pos_block{
//     opacity: .5;
//     position: absolute;
//     top: 0em;
//     background-color: blueviolet;
//     display: block;
//     height: 100%;
//     width: 1em;
//     transition-duration: 100ms;
//     transition: transform cubic-bezier(0.165, 0.84, 0.44, 1);
// }
// </style>
// `;

export class StaveComponent extends HTMLElement { 
    shadow;
    bpm = 0;
    bpm_display;
    bpm_input;
    btn_play;
    stave_canvas;
    notes;
    num_beats;
    beat_value;

    constructor(id, player, notes, num_beats = 4, beat_value = 4){
        super();
        
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));

        this.id = id;
        this.player = player;
        this.notes = notes;
        this.num_beats = num_beats;
        this.beat_value = beat_value;
        this.note_ind = 0;
        this.is_playing = false;
    }

    connectedCallback(){
        // select all of the elements
        this.bpm_input = this.shadow.querySelector("#bpm_input");
        this.bpm_display = this.shadow.querySelector("#bpm_display");
        this.btn_play= this.shadow.querySelector("#btn_play");
        this.stave_canvas = this.shadow.querySelector("#stave_canvas");
        this.pos_block = this.shadow.querySelector("#stave_canvas > .pos_block");

        // bpm related setup
        this.bpm = Number(this.bpm_input.value);
        this.bpm_display.innerHTML = `${this.bpm}`;

        this.pos_block.style.transitionDuration = `${
            blockTransitionDuration(this.bpm, Number(this.bpm_input.min))
        }ms`;

        this.bpm_input.addEventListener("input", (e) => {
            this.bpm = Number(e.currentTarget.value);
            this.bpm_display.innerHTML = `${this.bpm}`;
            if (this.id === this.player.track?.id) this.player.bpm = this.bpm;

            // Smooth transition
            this.pos_block.style.transitionDuration = `${
                blockTransitionDuration(this.bpm, Number(this.bpm_input.min))
            }ms`;
        });

        // stave rendering
        const renderer = new Vex.Flow.Renderer(this.stave_canvas, Vex.Flow.Renderer.Backends.SVG);
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

        // console.log(this.notes);

        voice.addTickables(this.notes);

        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 400);

        voice.draw(context, stave);
        stave.setContext(context).draw();

        // player logic itself
        this.btn_play.addEventListener("click", (e) => {
            this.is_playing = !this.is_playing;
            e.currentTarget.textContent = this.is_playing ? "Stop" : "Play";
            if (this.is_playing){
                this.note_ind = 0;
                this.player.bpm = this.bpm;
                this.player.changeTrack({
                    id: this.id, 
                    notes: this.notes, // array of VexFlow note objects
                    metronome: {
                        dur: "4n",
                    },
                    sequence: {
                        callback: (time, note) => {
                            // console.log(time, note);
                            const bb = this.notes[this.note_ind].getBoundingBox();
                            this.pos_block.style.width = `${bb.width}px`;
                            this.pos_block.style.transform = `translateX(${bb.x}px)`
                            this.note_ind++;
                            if(this.note_ind >= this.notes.length) 
                                this.note_ind = 0;
                        },
                        dur: "16n",
                    },
                    stop_callback: () => {
                        this.btn_play.textContent = "Play";
                        this.is_playing = false;
                    }
                });
                this.player.start();
            } else{
                this.player.stop();
            }
        });
    }

    disconnectedCallback(){
    }
}

customElements.define("drum-stave", StaveComponent);

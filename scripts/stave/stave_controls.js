import { ExerciseWebcomponent } from "/scripts/core/exercise_component.js";

const template = document.createElement("template");
template.innerHTML = 
`
<div>
    <button type="button" id="btn_play">Play</button>
    <label>
        Autoplay
        <input id="autoplay" type="checkbox" />
    </label>
    <label>
        Number of loops
        <input id="loop_count" type="number" value="2" />
    </label>
    <label>
        Drums volume
        <input id="drums_volume" type="range" min="0" max="100" />
    </label>
    <label>
        Metronome volume
        <input id="metronome_volume" type="range" min="0" max="100" />
    </label>

    <label>
        <span>BPM:<span id="bpm_value"></span></span>
        <input id="bpm_input" type="range" min="30" max="250"/>
    </label>
    <label>
        Current pattern
        <select id="pattern"></select>
    </label>
</div>
`;

export class StaveControls extends ExerciseWebcomponent{
    #is_playing = false;

    constructor(exercise, options){
        super(exercise);

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));

        this.pattern_options = options;
    }

    connectedCallback(){
        this.btn_play = this.shadow.querySelector("#btn_play");
        this.loop_count = this.shadow.querySelector("#loop_count");
        this.autoplay = this.shadow.querySelector("#autoplay");
        this.metronome = this.shadow.querySelector("#metronome");
        this.drums = this.shadow.querySelector("#drums");
        this.bpm_value = this.shadow.querySelector("#bpm_value");
        this.bpm_input = this.shadow.querySelector("#bpm_input");

        this.metronome_volume_input = this.shadow.querySelector("#metronome_volume");
        this.drums_volume_input = this.shadow.querySelector("#drums_volume");

        this.bpm_value.innerHTML = this.bpm_input.value;

        this.pattern = this.shadow.querySelector("#pattern");
        this.pattern_options.forEach(el => {
            const opt = document.createElement("option");
            opt.value = el.value;
            opt.text = el.text;
            this.pattern.add(opt, null);
        });

        this.btn_play.addEventListener("click", () => {
            this.#is_playing = !this.#is_playing;
            this.exercise.notify(this, this.#is_playing ? "play" : "stop", this.#is_playing);
        });

        this.metronome_volume_input.addEventListener("change", (e) => {
            this.exercise.notify(
                this,
                "metronome", 
                Number(e.currentTarget.value),
            );
        });

        this.drums_volume_input.addEventListener("change", (e) => {
            this.exercise.notify(
                this,
                "drums", 
                Number(e.currentTarget.value),
            );
        });

        this.loop_count.addEventListener("change", (e) => {
            this.exercise.notify(this, "loop_count", Number(e.currentTarget.value));
        });

        this.autoplay.addEventListener("change", (e) => {
            this.exercise.notify(this, "stop");
            this.exercise.notify(this, "autoplay", Boolean(e.currentTarget.checked));
        });

        this.bpm_input.addEventListener("input", (e) => {
            const bpm = Number(e.currentTarget.value);
            this.bpm_value.innerHTML = `${bpm}`;
            this.exercise.notify(this, "bpm", bpm);
        });

        this.pattern.addEventListener("input", (e) => {
            this.exercise.notify(this, "pattern", Number(e.currentTarget.value));
        });
    }

    get bpm(){
        return Number(this.bpm_input.value);
    }
    
    get is_playing() { return this.#is_playing; }
    set is_playing(value){
        this.#is_playing = Boolean(value);
        this.btn_play.innerHTML = this.#is_playing ? "Stop" : "Play"; 
        this.pattern.disabled = this.#is_playing;
        this.autoplay.disabled = this.#is_playing;
        this.loop_count.disabled = this.#is_playing;
    }

    get note_ind() { return Number(this.pattern.value); }
    set note_ind(value){
        this.pattern.value = Number(value);
    }
}

window.customElements.define("stave-controls", StaveControls);

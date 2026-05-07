import { ExerciseWebcomponent } from "/scripts/core/exercise_component.js";

const template = document.createElement("template");
template.innerHTML = 
`
<label style="grid-area: bpm">
    <span>BPM &mdash; <span id="bpm_value"></span></span>
    <input id="bpm_input" type="range" min="30" max="250"/>
</label>
<button style="grid-area: btn" type="button" id="btn_play">Play</button>
<label class="horiz" style="grid-area: auto">
    Autoplay
    <input id="autoplay" type="checkbox" />
</label>
<label style="grid-area: loop">
    Number of loops
    <input id="loop_count" type="number" value="2" />
</label>
<label style="grid-area: drum">
    <span>Drums volume &mdash; <span id="drums_value"></span></span>
    <input id="drums_volume" type="range" min="0" max="100" />
</label>
<label style="grid-area: metronome">
    <span>Metronome volume &mdash; <span id="metronome_value"></span></span>
    <input id="metronome_volume" type="range" min="0" max="100" />
</label>
<label style="grid-area: pattern">
    Current pattern
    <select id="pattern"></select>
</label>
`;

export class StaveControls extends ExerciseWebcomponent{
    #is_playing = false;

    constructor(exercise, options){
        super(exercise);

        this.innerHTML = template.innerHTML;

        this.pattern_options = options;
    }

    connectedCallback(){
        this.btn_play = this.querySelector("#btn_play");
        this.loop_count = this.querySelector("#loop_count");
        this.autoplay = this.querySelector("#autoplay");
        this.metronome = this.querySelector("#metronome");
        this.drums = this.querySelector("#drums");
        this.bpm_value = this.querySelector("#bpm_value");
        this.bpm_input = this.querySelector("#bpm_input");
        this.metronome_volume_input = this.querySelector("#metronome_volume");
        this.metronome_volume_value = this.querySelector("#metronome_value");
        this.drums_volume_input = this.querySelector("#drums_volume");
        this.drums_volume_value = this.querySelector("#drums_value");
        this.bpm_value.innerHTML = this.bpm_input.value;
        this.drums_volume_value.innerHTML = this.drums_volume_input.value;
        this.metronome_volume_value.innerHTML = this.metronome_volume_input.value;
        this.pattern = this.querySelector("#pattern");


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

        this.metronome_volume_input.addEventListener("input", (e) => {
            this.metronome_volume_value.innerHTML = e.currentTarget.value;
            this.exercise.notify(
                this,
                "metronome", 
                Number(e.currentTarget.value),
            );
        });

        this.drums_volume_input.addEventListener("input", (e) => {
            this.drums_volume_value.innerHTML = e.currentTarget.value;
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
            this.bpm_input.style.setProperty("--progress", `${(bpm - Number(this.bpm_input.min))/(Number(this.bpm_input.max) - Number(this.bpm_input.min)) * 100}%`)
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

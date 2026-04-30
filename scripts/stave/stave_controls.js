import { ExerciseWebcomponent } from "/scripts/core/exercise_component.js";

const template = document.createElement("template");
template.innerHTML = 
`
<div>
    <button type="button" id="btn_play">Play</button>
    <label>
        Number of pattern loops
        <input id="loop_count" type="number" />
    </label>
    <label>
        Countdown
        <input id="countdown" type="number" />
    </label>
    <label>
        Autoplay
        <input id="autoplay" type="checkbox" />
    </label>
    <label>
        Metronome
        <input id="metronome" type="checkbox" />
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
        //TODO: impl after mvp
        // this.loop_count = this.shadow.querySelector("#loop_count");
        // this.countdown = this.shadow.querySelector("#countdown");
        // this.autoplay = this.shadow.querySelector("#autoplay");
        this.metronome = this.shadow.querySelector("#metronome");
        this.bpm_value = this.shadow.querySelector("#bpm_value");
        this.bpm_input = this.shadow.querySelector("#bpm_input");

        this.pattern = this.shadow.querySelector("#pattern");
        this.pattern_options.forEach(el => {
            const opt = document.createElement("option");
            opt.value = el.value;
            opt.text = el.text;
            this.pattern.add(opt, null);
        });

        this.btn_play.addEventListener("onclick", (e) => {
            this.#is_playing = !this.#is_playing;
            e.currentTarget.innerHTML = this.#is_playing ? "Stop" : "Play"; 

            this.loop_count.disabled = this.#is_playing || Boolean(this.loop_count.value);
            this.countdown.disabled = this.#is_playing;
            this.autoplay.disabled = this.#is_playing;
            this.pattern.disabled = this.#is_playing || Boolean(this.loop_count.value);

            this.exercise.notify(this, this.#is_playing ? "play" : "stop", this.#is_playing);
        });

        //TODO: impl after mvp
        // this.loop_count.addEventListener("onchange", (e) => {
        //     this.exercise.notify(this, "loop_count", Number(e.currentTarget.value));
        // });
        //
        // this.countdown.addEventListener("onchange", (e) => {
        //     this.exercise.notify(this, "countdown", Boolean(e.currentTarget.value));
        // });
        //
        // this.autoplay.addEventListener("onchange", (e) => {
        //     this.exercise.notify(this, "autoplay", Boolean(e.currentTarget.value));
        //     this.loop_count.disabled = true;
        //     this.pattern.disabled = true;
        // });

        this.metronome.addEventListener("onchange", (e) => {
            this.exercise.notify(this, "metronome", Boolean(e.currentTarget.value));
        });

        this.bpm_input.addEventListener("onchange", (e) => {
            const bpm = Number(e.currentTarget.value);
            this.bpm_value.innerHTML = `${bpm}`;
            this.exercise.notify(this, "bpm", bpm);
        });

        this.pattern.addEventListener("onchange", (e) => {
            this.exercise.notify(this, "pattern", Number(e.currentTarget.value));
        });
    }
}

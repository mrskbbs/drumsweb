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
        this.exercise.renderer = new StaveRenderer(this.exercise);
        this.exercise.sound = new StaveSound(this.exercise);
        this.exercise.controls = new StaveControls(this.exercise);

        this.shadow.querySelector("#renderer_tmpl")
            .replaceWith(this.exercise.renderer.webcomponent);
        this.shadow.querySelector("#controls_tmpl")
            .replaceWith(this.exercise.controls.webcomponent);
    }
}
customElements.define("rhythm-exercise", RhythmExerciseWebcomponent);

class RhythmExercise extends Exercise { 
    renderer;
    sound;
    controls;

    constructor(){
        super();
    }

    notify(sender, event, value){
        switch(sender){
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
            case "play":
                break;
            case "stop":
                break;
            case "change_notes":
                break;
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
            case "autoplay":
                this.exercise.sound.autoplay = Boolean(value);
                break;
            case "metronome_on":
                this.exercise.sound.metronome_on = Boolean(value);
                break;
            case "change_notes":
                this.exercise.renderer.changeNotes(value);
                this.exercise.sound.changeNotes(value);
                break;
            case "delay_between":
                this.exercise.sound.delay_between = Number(value);
                break;
            case "loop_count":
                this.exercise.sound.loop_count = Number(value);
                break;
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
}

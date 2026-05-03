import { ExerciseComponent } from "/scripts/core/exercise_component.js";
import { vexFlowToMidi } from "../utils.js";

export class StaveSound extends ExerciseComponent{
    autoplay_on = false;
    loop_count = 2;

    constructor(exercise, sequence_measure, metronome_measure){
        super(exercise);
        
        this.notes_ind = 0;
        this.loop_ind = 0;

        this.sequence_player = undefined;
        this.sequence_measure = sequence_measure;
        this.sequence_ind = 0;

        this.metronome_measure = metronome_measure;
        this.metronome_ind= 0;

        this.metronome_sampler = new Tone.Sampler({
            urls: {
                A5: "click.ogx", 
                A6: "clickAccent.ogx",
            },
            baseUrl: "/public/metronome/",
        }).toDestination();

        this.drums_sampler = new Tone.Sampler({
            urls: {
                "C1": "kick.mp3",
                "D1": "snare.mp3",
                "G1": "tom3.mp3",
                "B1": "tom2.mp3",
                "D2": "tom1.mp3",
                "F#1": "hihat.mp3",
            },
            baseUrl: "/public/drum/",
        }).toDestination();

        this.metronome_player = new Tone.Loop((time) => {
            this.metronome_sampler.triggerAttackRelease(
                this.metronome_ind === 0 ? "A6" : "A5", 
                "32n", 
                time, 
                0.1
            );
            this.metronome_ind = (this.metronome_ind + 1) % 4;
        }, `${this.metronome_measure}n`);
    }

    play(){
        const cur_note = this.exercise.notes[this.notes_ind];
        this.sequence_ind = 0;
        this.loop_ind = 0;
        this.metronome_ind = 0;
        this.sequence_player = new Tone.Sequence(
            (time, note) => {
                if(note !== undefined)
                    this.drums_sampler.triggerAttackRelease(vexFlowToMidi[note], "16n", time, 0.05);
                Tone.Draw.schedule(
                    () =>  {
                        this.exercise.notify(
                            this, 
                            "cursor_move", 
                            cur_note[this.sequence_ind].getBoundingBox()
                        );
                        this.sequence_ind++;

                        if(this.sequence_ind >= cur_note.length){
                            this.sequence_ind = 0;
                            this.loop_ind++;
                        }
                        if(this.autoplay_on && this.loop_ind >= this.loop_count){
                            this.nextNote();
                        }
                    }
                , time);
            }, 
            cur_note.map((v) => v.isRest() ? undefined : v.getKeys()[0]),
            `${this.sequence_measure}n`,
        );
        this.sequence_player.loop = this.autoplay_on ? this.loop_count : true;

        const start_time = this.autoplay_on ? "+1m" : 0;
        this.exercise.notify(this, "play");
        this.sequence_player.start(start_time, 0);
        this.metronome_player.start(0);
    }

    stop(){
        this.exercise.notify(this, "stop");

        this.sequence_player?.stop(0);
        this.metronome_player.stop(0);
    }    

    changeNotes(ind){
        this.stop();

        this.sequence_player.cancel(0);
        this.sequence_player.clear();
        this.sequence_player.dispose();

        this.sequence_player = undefined;

        if(ind < 0 || ind >= this.exercise.notes.length)
            throw new Error("Invalid note index");

        this.notes_ind = ind;
    }    

    nextNote(){
        this.stop();
        this.notes_ind++;

        if(this.notes_ind >= this.exercise.notes.length){
            this.notes_ind = 0;
            return;
        }

        this.exercise.notify(this, "next_note", this.notes_ind);
        this.play();
    }

    get metronome_volume() { return this.metronome_sampler.volume.value * 100; }
    set metronome_volume(value){
        this.metronome_sampler.volume.value = Tone.gainToDb(Number(value)/100);
    }

    get drums_volume() { return this.drums_sampler.volume.value * 100; }
    set drums_volume(value){
        this.drums_sampler.volume.value = Tone.gainToDb(Number(value)/100);
    }
}

import { ExerciseComponent } from "/scripts/core/exercise_component.js";

export class StaveSound extends ExerciseComponent{
    #metronome_on = true;

    constructor(exercise, sequence_measure, metronome_measure){
        super(exercise);
        
        this.notes_ind = 0;

        this.sequence_player = undefined;
        this.sequence_measure = sequence_measure;
        this.sequence_ind = 0;
        this.metronome_measure = metronome_measure;

        this.metronome_sampler = new Tone.Sampler({
            urls: {
                A5: "click.ogx" 
            },
            baseUrl: "/public/",
        }).toDestination();

        this.metronome_player = new Tone.Loop((time) => {
            this.metronome_sampler.triggerAttackRelease("A5", "32n", time, 0.05);
        }, "4n");
        this.metronome_player.start(0);
    }

    play(){
        const cur_note = this.exercise.notes[this.notes_ind];
        this.sequence_ind = 0;
        this.sequence_player = new Tone.Sequence(
            (time) => {
                Tone.Draw.schedule(
                    () =>  {
                        this.exercise.notify(
                            this, 
                            "cursor_move", 
                            cur_note[this.sequence_ind].getBoundingBox()
                        );
                        console.log(this.sequence_ind);
                        this.sequence_ind++;

                        if(this.sequence_ind >= cur_note.length)
                            this.sequence_ind = 0;
                    }
                , time);
            }, 
            cur_note.map((v) => v.isRest() ? undefined : v.getKeys()[0]),
            "16n",
        );
        this.sequence_player.loop = true;

        this.exercise.notify(this, "play");
        this.sequence_player.start(0, 0);
    }

    stop(){
        this.exercise.notify(this, "stop");

        this.sequence_player.stop(0);
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

        this.start();
    }    

    get metronome_on(){ return this.#metronome_on; }
    set metronome_on(value){
        this.#metronome_on = Boolean(value);
        this.metronome_sound.volume.value = this.#metronome_on ? -10 : -Infinity;
    }
}


// Storing this iteration as a reference for future TODO features impl
// class StaveSound extends ExerciseComponent {
//     notes; 
//     note_ind;
//
//     #autoplay;
//     delay_between;
//     loop_count;
//     #metronome_on;
//
//     constructor(exercise){
//         super(exercise);
//
//         this.notes = notes;
//         this.note_ind = 0;
//         this.sequence_measure = sequence_measure;
//         this.metronome_measure = metronome_measure;
//
//         this.loop_count = loop_count;
//         this.delay_between = delay_between;
//         this.#autoplay = autoplay;
//         this.#metronome_on = metronome_on;
//
//         this.metronome_sampler = new Tone.Sampler({
//             urls: {
//                 A5: "click.ogx" 
//             },
//             baseUrl: "/public/",
//         }).toDestination();
//
//         this.metronome_player = new Tone.Loop((time) => {
//             this.metronome_sampler.triggerAttackRelease("A5", "32n", time, 0.8);
//         }, `${this.metronome_measure}n`);
//
//         this.sequence_player = undefined;
//         this.autoplay_schedule = undefined;
//     }
//
//     play(){
//         const cur_note = this.notes[this.note_ind];
//
//         if(this.sequence_player === undefined){
//             this.sequence_player = new Tone.Sequence(
//                 (time) => {
//                     Tone.Draw.schedule(() => this.exercise.notify(this, "tick"), time);
//                 }, 
//                 cur_note.map((v) => v.isRest() ? null : v.getKeys()[0]),
//                 this.sequence_measure,
//             );
//             if(this.#autoplay)
//                 this.autoplay_schedule = Tone.Transport.scheduleOnce(
//                     () => {
//                         if(this.note_ind === this.notes.length - 1) this.stop();
//                         else this.changeNotes(this.note_ind + 1);
//                     },
//                     Tone.Time(this.sequence_player.loopEnd).toTicks() * this.loop_count,
//                 );
//         }
//
//         const start_time = `+${this.delay_between}m}`;
//
//         this.exercise.notify(this, "start");
//         this.metronome_player.start(0);
//         this.sequence_player.start(start_time, 0);
//     }
//
//     stop(){
//         this.exercise.notify(this, "stop");
//
//         Tone.Transport.clear(this.autoplay_schedule);
//         this.autoplay_schedule = undefined;
//
//         this.metronome_player.stop(0);
//
//         this.sequence_player.stop(0);
//         this.sequence_player.cancel(0);
//         this.sequence_player.clear();
//         this.sequence_player.dispose();
//     }    
//
//     rescheduleNextTrack(){
//         if(!this.#autoplay) return;
//
//         Tone.Transport.clear(this.autoplay_schedule);
//         this.autoplay_schedule = Tone.Transport.scheduleOnce(
//             () => {
//                 if(this.note_ind === this.notes.length - 1) this.stop();
//                 else this.changeNotes(this.note_ind + 1);
//             },
//             Tone.Time(this.sequence_player.loopEnd).toTicks() * this.loop_count,
//         );
//     }
//
//     changeNotes(ind){
//         if(!this.#autoplay)
//             throw new Error("Autoplay is on, disable it first");
//
//         this.stop();
//         this.sequence_player = undefined;
//
//         if(ind < 0 || ind >= this.notes.length)
//             throw new Error("Invalid note index");
//
//         this.note_ind = ind;
//
//         this.start();
//     }    
//
//     get autoplay(){ return this.#autoplay; }
//     set autoplay(value){
//         this.#autoplay = Boolean(value);
//         this.sequence_player.loop.value = this.#autoplay ? this.loop_count : true;
//     }
//
//     get metronome_on(){ return this.#metronome_on; }
//     set metronome_on(value){
//         this.#metronome_on = Boolean(value);
//         this.metronome_sound.volume.value = this.#metronome_on ? -10 : -Infinity;
//     }
// }

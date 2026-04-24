export class Player {
    constructor(){
        /*
        Track syntax:
        {
            id: string,
            notes: array[], // array of VexFlow note objects
            metronome: {
                callback: (time) => void,
                dur:  4n | 8n | 16n | etc.,
            },
            sequence: {
                callback: (time, note) => void,
                dur: 4n | 8n | 16n | etc.,
            },
            
        }
        */
        this.track = undefined; // active track 

        this.metronome = new Tone.Synth(
            {
                oscillator: { type: "square" },
                envelope: {
                attack: 0.001,
                decay: 0.02,
                sustain: 0,
                release: 0.01,
            },
        }).toDestination();         

        this.sequence = undefined;
    }

    get bpm(){
        return Tone.Transport.bpm.value;
    }

    set bpm(bpm){
        Tone.Transport.bpm.value = Number(bpm);
    }

    start(){
        if(this.track === undefined) {
            console.warn("Can't play anything. Track is not selected");
            return;
        }
        Tone.Transport.seconds = 0;
        Tone.Transport.start();
        this.metronome_loop.start(0);
        this.sequence.start(0, 0);
    }

    stop(){
        if(this.track === undefined) {
            console.warn("Can't play anything. Track is not selected");
            return;
        }
        
        Tone.Transport.stop();
        this.metronome_loop.stop(0);
        this.sequence.stop(0);
        Tone.Transport.position = 0;
    }

    clearTrack(){
        this.stop();

        this.track = undefined;
        this.metronome_loop = undefined;
        this.sequence = undefined;
        this.sequence_loop = undefined;
    }

    changeTrack(new_track){
        if(new_track === undefined){
            console.error("new_track property must be defined");
            return;
        }

        if(new_track.id === this.track?.id){
            console.info("Event is already active");
            return;
        }

        this.clearTrack();
        this.track = new_track;
        
        this.metronome_loop = new Tone.Loop((time) => {
            this.track.metronome.callback?.(time);
            this.metronome.triggerAttackRelease("A5", "32n", time, 0.8);
        }, this.track.metronome.dur);

        this.sequence = new Tone.Sequence(
            this.track.sequence.callback, 
            this.track.notes.map((v) => v.isRest() ? undefined : v.getKeys()[0]),
            this.track.sequence.dur,
        );
        this.sequence.loop = true;
    }
}

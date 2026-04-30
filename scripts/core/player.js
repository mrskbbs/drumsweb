export class Player {
    track;
    constructor(){
        /*
        Track syntax:
        {
            id: string,
            notes: array[], // array of VexFlow note objects
            metronome: {
                callback: (time) => void,
                measure:  4n | 8n | 16n | etc.,
            },
            sequence: {
                callback: (time, note) => void,
                measure: 4n | 8n | 16n | etc.,
            },
            stop_callback: () => void,
        }
        */
        this.track = undefined; // active track 

        this.metronome = new Tone.Sampler({
            urls: {
                A5: "click.ogx" 
            },
            baseUrl: "/public/",
        }).toDestination();

        this.metronome.volume.value = -10;

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
        this.track.stop_callback();
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
            Tone.Draw.schedule(() => {
                this.track.metronome.callback?.(time);
            }, time);
            this.metronome.triggerAttackRelease("A5", "32n", time, 0.8);
        }, this.track.metronome.measure);

        this.sequence = new Tone.Sequence(
            (time) => {
                Tone.Draw.schedule(() => this.track.sequence.callback(), time)
            }, 
            this.track.notes.map((v) => v.isRest() ? undefined : v.getKeys()[0]),
            this.track.sequence.measure,
        );
        this.sequence.loop = true;
    }
}

export const player = new Player();

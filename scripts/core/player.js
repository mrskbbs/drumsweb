export class Player {
    subscribers;
    active;
    metronome_volume_input;
    drums_volume_input;

    // TODO improve logic of syncing different exercises 
    constructor(metronome_volume_input, drums_volume_input){
        this.subscribers = new Set();
    }

    get bpm(){
        return Tone.Transport.bpm.value;
    }

    setBPM(caller, bpm){
        if (caller !== this.active) return;
        Tone.Transport.bpm.value = Number(bpm);
    }

    play(caller, bpm){
        if(!this.subscribers.has(caller))
            throw new Error("Caller is not present in subscribers");
        
        if(bpm !== undefined)
            Tone.Transport.bpm.value = Number(bpm);

        this.subscribers.forEach((s) => {
            if(s !== caller) s.notify(s.controls, "stop"); 
        });
        this.active = caller;

        Tone.Transport.seconds = 0;
        Tone.start();
        Tone.Transport.start();
    }

    stop(){
        this.active = undefined;
        Tone.Transport.stop();
        Tone.Transport.position = 0;
    }

    subscribe(subscriber){
        this.subscribers.add(subscriber);
        // subscriber.notify(
        //     this,
        //     "drums_volume", 
        //     Number(this.drums_volume_input.value),
        // );
        // subscriber.notify(
        //     this,
        //     "metronome_volume", 
        //     Number(this.metronome_volume_input.value),
        // );
    }

    unsubscribe(subscriber){
        this.subscribers.delete(subscriber);
    }
}

export const player = new Player();

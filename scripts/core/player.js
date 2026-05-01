export class Player {
    subscribers;
    active;
    // TODO improve logic of syncing different exercises 
    constructor(){
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
    }

    unsubscribe(subscriber){
        this.subscribers.delete(subscriber);
    }
}

export const player = new Player();

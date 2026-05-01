export class Player {
    subscribers;

    constructor(){
        this.subscribers = new Set();
    }

    get bpm(){
        return Tone.Transport.bpm.value;
    }

    set bpm(bpm){
        Tone.Transport.bpm.value = Number(bpm);
    }

    play(caller, bpm){
        if(!this.subscribers.has(caller))
            throw new Error("Caller is not present in subscribers");
        
        if(bpm !== undefined)
            Tone.Transport.bpm.value = Number(bpm);

        this.subscribers.keys()
            .map((s) => { 
                if(s !== caller) s.notify(s.sound, "stop"); 
            });

        Tone.Transport.seconds = 0;
        Tone.start();
        Tone.Transport.start();
    }

    stop(){
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

// abstract class defining an exercise 
// mediator between multiple exercise components

export class Exercise {
    constructor(){
        if(new.target === Exercise)
            throw new Error("Cannot instantiate abstract class directly");
    }

    notify(sender, event){ throw new Error("Method must be defined"); }
}

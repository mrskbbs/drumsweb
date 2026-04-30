// abstract class defining an exercise 
// mediator between multiple exercise components

export class ExerciseComponent {
    constructor(exercise){
        if(new.target === ExerciseComponent)
            throw new Error("Cannot instantiate abstract class directly");

        this.exercise = exercise;
    }
}

export class ExerciseWebcomponent extends HTMLElement{
    // TODO: illegal constructor
    constructor(exercise){
        super();
        if(new.target === ExerciseComponent)
            throw new Error("Cannot instantiate abstract class directly");

        this.exercise = exercise;
    }
}

// abstract class defining an exercise 
// mediator between multiple exercise components

export class ExerciseComponent {
    constructor(exercise){
        if(new.target === ExerciseComponent)
            throw new Error("Cannot instantiate abstract class directly");

        this.exercise = exercise;
    }
}

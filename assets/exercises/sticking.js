import { PatternExerciseBase, PatternExerciseBaseWebcomponent } from "./assets/exercises/bases/patterns.js";

class StickingExercise extends PatternExerciseBase { 

    generateNotes(){
        /* 
           procedural generation of patterns 
           true - snare
           false - rest note
           we need all combinations for four notes, and we have two options -> 2^4
        */

        for(let i = 1; i < Math.pow(2, 4); i++){
            // little bitwise op magic
            const pattern = [
                Boolean(i & 1), // 1st rightmost bit is 1?
                Boolean(i & 2), // 2nd rightmost bit is 1? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ];

            this.notes.set(
                pattern.map((v) => v ? "R" : "L" ).join(" "),
                this.createNote(pattern),
            );
        }

        this.notes_list = this.notes.keys().toArray().sort();
    }

    createNote(pattern){
        const inv_pattern = pattern.map((v) => !v);
        return [].concat(pattern, inv_pattern)
            .map(
                (v) => {
                    const note = new Vex.Flow.StaveNote({clef: "percussion", keys: ["c/5"], duration: `${this.options.sequence_measure}`});

                    note.addModifier(
                        0,
                        new Vex.Flow.Annotation(v ? "R" : "L")
                          .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM)
                          .setJustification(Vex.Flow.Annotation.Justify.CENTER),
                    );        

                    return note;
                }
            );
    }
}

export class StickingExerciseWebcomponent extends PatternExerciseBaseWebcomponent{
    constructor(player){
        super(
            player, 
            StickingExercise,
            {
                num_beats: 4,
                beat_value: 4, // these two represent time signature like this: num_beats/beat_value
                sequence_measure: 8,
                metronome_measure: 4, // these two represent note duration 1/sequence_measure (i.e. 1/8, 1/16 etc.)
            }
        );
    }
}

customElements.define("sticking-exercise", StickingExerciseWebcomponent);

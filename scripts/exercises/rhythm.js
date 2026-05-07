import { PatternExerciseBase, PatternExerciseBaseWebcomponent } from "./base_patterns.js";

class RhythmExercise extends PatternExerciseBase { 
    counts = [1, "e", "&", "a"];

    constructor(player){
        super(player);
    }

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
                Boolean(i & 2), // 2nd rightmost bit is 2? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ];

            this.notes.set(
                pattern.map((v, i) => {
                    if (v) return String(this.counts[i]);
                }).join(" "),
                this.createNote(pattern),
            );
        }
    }

    createNote(pattern){
        const counts = [...this.counts];
        return [].concat(pattern, pattern, pattern, pattern)
            .map(
                (v, i) => {
                    const note = v 
                        ? new Vex.Flow.StaveNote({clef: "percussion", keys: ["c/5"], duration: "16"}) 
                        : new Vex.Flow.StaveNote({keys: ["c/5"], duration: "16r"});

                    note.addModifier(
                        0,
                        new Vex.Flow.Annotation(String(counts[i % 4]))
                          .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP)
                          .setJustification(Vex.Flow.Annotation.Justify.CENTER),
                    );

                    if (v) {
                        note.addModifier(
                            0,
                            new Vex.Flow.Annotation(i % 2 == 0 ? "R" : "L")
                              .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM)
                              .setJustification(Vex.Flow.Annotation.Justify.CENTER),
                        );        
                    }

                    if(i % 4 === 0) counts[0] += 1;

                    return note;
                }
            );
    }
}

export class RhythmExerciseWebcomponent extends PatternExerciseBaseWebcomponent{
    constructor(player){
        console.log(RhythmExercise);
        super(player, RhythmExercise);
    }
}

customElements.define("rhythm-exercise", RhythmExerciseWebcomponent);

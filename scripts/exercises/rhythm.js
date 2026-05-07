import { PatternExerciseBase, PatternExerciseBaseWebcomponent } from "/scripts/exercises/bases/patterns.js";

class RhythmExercise extends PatternExerciseBase { 
    counts = [1, "e", "&", "a"];

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
                pattern.map((v, i) => {
                    if (v) return String(this.counts[i]);
                }).join(" "),
                this.createNote(pattern),
            );
        }

        this.notes_list = this.notes.keys().toArray().sort();
    }

    createNote(pattern){
        /* 
            1 & - RL
            & - L 
        */
        const counts = [...this.counts];
        return [].concat(pattern, pattern, pattern, pattern)
            .map(
                (v, i) => {
                    const note = v 
                        ? new Vex.Flow.StaveNote({clef: "percussion", keys: ["c/5"], duration: `${this.options.sequence_measure}`}) 
                        : new Vex.Flow.StaveNote({keys: ["c/5"], duration: `${this.options.sequence_measure}r`});

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
        super(
            player, 
            RhythmExercise,
            {
                num_beats: 4,
                beat_value: 4, // these two represent time signature like this: num_beats/beat_value
                sequence_measure: 16,
                metronome_measure: 4, // these two represent note duration 1/sequence_measure (i.e. 1/8, 1/16 etc.)
            }
        );
    }
}

customElements.define("rhythm-exercise", RhythmExerciseWebcomponent);

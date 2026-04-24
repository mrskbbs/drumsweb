// procedural generation of patterns 
// true - snare
// false - rest note
const patterns = [];

// we need all combinations for four notes, and we have two options -> 2^4
for (let i = 1; i < Math.pow(2, 4); i++){
    // little bitwise op magic
    patterns.push([
        Boolean(i & 1), // 1st rightmost bit is 1?
        Boolean(i & 2), // 2nd rightmost bit is 2? etc.
        Boolean(i & 4),
        Boolean(i & 8),
    ]);
}

function generateNotes(pattern){
    const counts = ["1", "e", "&", "a"];
    // Add a clef and time signature.
    const stave = new Vex.Flow.Stave(10, 40, 500);
    stave.addClef("percussion").addTimeSignature("4/4");
    return [].concat(pattern, pattern, pattern, pattern)
        .map(
            (v, i) => {
                const note = v 
                    ? new Vex.Flow.StaveNote({clef: "percussion", keys: ["c/5"], duration: "16"}) 
                    : new Vex.Flow.StaveNote({keys: ["c/5"], duration: "16r"});

                note.addModifier(
                    0,
                    new Vex.Flow.Annotation(counts[i % 4])
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

                return note;
            }
        );
}

export default({
    generateNotes,
    patterns,
});

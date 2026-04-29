import { player } from "/scripts/player.js";
import { StaveComponent } from "/scripts/webcomponents/stave/stave.js";

const template = document.createElement("template");
template.innerHTML = 
`
<div>
    <div>
        Controls
        <span id="controls"></span>
    </div>
    <div id="stave_container"></div>
</div>
`;

export class RythmExercise extends HTMLElement{
    patterns = [];
    notes = [];

    constructor(){
        super();
        
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.selectElements();
        this.generatePatterns();
        this.drawStave(this.notes[0]);
    }

    selectElements(){
        this.stave_container = this.shadow.querySelector("#stave_container");
    }

    drawStave(notes){
        console.log(notes);
        this.stave_container.childNodes.values().map((n) => this.stave_container.removeChild(n));
        this.stave_container.appendChild(
            new StaveComponent(
                "common_rythms",
                player,
                notes,
                "16n",
            )
        );
    }

    generatePatterns(){
        /* 
           procedural generation of patterns 
           true - snare
           false - rest note
           we need all combinations for four notes, and we have two options -> 2^4
        */
        for (let i = 1; i < Math.pow(2, 4); i++){
            // little bitwise op magic
            this.patterns.push([
                Boolean(i & 1), // 1st rightmost bit is 1?
                Boolean(i & 2), // 2nd rightmost bit is 2? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ]);

            this.notes.push(this.generateNotes([
                Boolean(i & 1), // 1st rightmost bit is 1?
                Boolean(i & 2), // 2nd rightmost bit is 2? etc.
                Boolean(i & 4),
                Boolean(i & 8),
            ]));
        }
    }

    generateNotes(pattern){
        const counts = [1, "e", "&", "a"];

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

customElements.define("rythm-exercises", RythmExercise);

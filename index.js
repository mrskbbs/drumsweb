const patterns = [];

for (let i = 1; i < Math.pow(2, 4); i++){
    patterns.push([
        Boolean(i & 1),
        Boolean(i & 2),
        Boolean(i & 4),
        Boolean(i & 8),
    ]);
}
const selected_pattern = patterns[6];
console.log(patterns);

const bpm_slider = document.querySelector("#bpm");
const bpm_value = document.querySelector("#bpm_value");
const btn_switch = document.querySelector("#btn_switch");

const metronome_synth = new Tone.Synth({
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.02,
    sustain: 0,
    release: 0.01,
  },
}).toDestination(); 

const metronome = new Tone.Loop((time) => {
    metronome_synth.triggerAttackRelease("A5", "32n", time, 0.8);
    console.info(time);
}, "4n");






let bpms = Number(bpm_slider.value);
bpm_value.textContent = `${bpms}`;
Tone.Transport.bpm.value = bpms;


const { Renderer, Stave, StaveNote, Voice, Formatter, Annotation } = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "output".
const div = document.getElementById("output");
const block = document.getElementById("block");
block.style.transitionDuration = `${((60/bpms)/(60/30)) * 150}ms`;
const renderer = new Renderer(div, Renderer.Backends.SVG);

block.style.animationDuration = `${(60 / bpms) * 8}s`;
// Configure the rendering context.
renderer.resize(500, 150);
const context = renderer.getContext();
// Create a stave of width 400 at position 10, 40 on the canvas.
const stave = new Stave(10, 40, 500);

const counts = ["1", "e", "&", "a"];
// Add a clef and time signature.
stave.addClef("percussion").addTimeSignature("4/4");
const notes = [].concat(selected_pattern, selected_pattern, selected_pattern, selected_pattern)
.map(
    (v, i) => {
        const note = v 
            ? new StaveNote({clef: "percussion", keys: ["c/5"], duration: "16"}) 
            : new StaveNote({keys: ["c/5"], duration: "16r"});

        note.addModifier(
            0,
            new Annotation(counts[i % 4])
              .setVerticalJustification(Annotation.VerticalJustify.TOP)
              .setJustification(Annotation.Justify.CENTER),
        );

        if (v) {
            note.addModifier(
                0,
                new Annotation(i % 2 == 0 ? "R" : "L")
                  .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
                  .setJustification(Annotation.Justify.CENTER),
            );        
        }

        return note;
    }
);

const voice = new Voice({ numBeats: 4, beatValue: 4 });
voice.addTickables(notes);

new Formatter().joinVoices([voice]).format([voice], 400);

voice.draw(context, stave);
stave.setContext(context).draw();

let count = 0;
const sequence = new Tone.Sequence((time, note) => {
    const bb = notes[count].getBoundingBox();
    block.style.width = `${bb.width}px`;
    block.style.transform = `translateX(${bb.x}px)`
    count++;
    if(count >= 16) count = 0;
}, selected_pattern.map((v) => v ? "C2" : undefined), "16n");
sequence.loop = true;

let is_running = false;


bpm_slider.addEventListener("input", (e) => {
    bpms = Number(e.currentTarget.value);
    bpm_value.textContent = `${e.currentTarget.value}`;
    Tone.Transport.bpm.rampTo(bpms);
    block.style.transitionDuration = `${((60/bpms)/(60/30)) * 150}ms`;
});

btn_switch.addEventListener("click", (e) => {
    is_running = !is_running;
    e.currentTarget.textContent = is_running ? "Stop" : "Run";
    Tone.Transport.toggle();
    if (is_running) {
        metronome.start(0);
        sequence.start(0, 0);
    }
    else {
        metronome.stop(0);
        sequence.stop(0);
        count = 0;
    }
});



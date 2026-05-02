export function blockTransitionDuration(bpm, min_bpm, base_dur_ms = 150){
    return ( (60/bpm) / (60/Number(min_bpm)) ) * base_dur_ms;
}

export const vexFlowToMidi = {
    "f/4": "C1",
    "c/5": "D1",
    "a/4": "G1",
    "d/5": "B1",
    "e/5": "D2",
    "g/5": "F#1",
}

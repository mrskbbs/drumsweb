export function blockTransitionDuration(bpm, min_bpm, base_dur_ms = 150){
    return ( (60/bpm) / (60/Number(min_bpm)) ) * base_dur_ms;
}

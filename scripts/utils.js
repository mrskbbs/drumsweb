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

const updateSliderProgress = (slider) => {
    slider.style.setProperty('--progress', `${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%`);
};

export function slidersProgressFix(){
    const allSliders = document.querySelectorAll('input[type="range"]');

    allSliders.forEach((slider) => {
        updateSliderProgress(slider);

        slider.addEventListener('input', () => {
            updateSliderProgress(slider);
        });
    });
}


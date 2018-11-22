const beatMeasure = 16;
const bpm = 110;
const bpmPerMilli = 15000/bpm;
const instruments = ['kick', 'snare', 'hihat', 'openhat'];
let currentMeasure = 0;
let currentlyPlaying;

function resetSelected() {
    $('.row > .pad.selected').removeClass('selected');
}

function handleReset() {
    $('.resetbutton').click(resetSelected);
}

function playBeat(instrument) {
    console.log(`hit ${instrument}`);
    // resets currentTime so when other buttons are clicked it can start immediately playing
    $(`audio[data-key='${instrument}']`)[0].currentTime = 0;
    $(`audio[data-key='${instrument}']`)[0].play()
}

function playSequencer() {
    if (currentMeasure == 16) currentMeasure = 0;
    console.log(currentMeasure);
    for (let i = 0; i < $(`.${currentMeasure}`).length; i++){
        if ($(`.${currentMeasure}:eq(${i})`).hasClass('selected')) {
            currentInstrument = $(`.${currentMeasure}:eq(${i})`).attr('data-key');
            playBeat(currentInstrument);

        }
    }
    currentMeasure++;
}

function switchPlayButton() {
    $('.playbutton').toggleClass('hidden');
    $('.stopbutton').toggleClass('hidden');
}

function togglePlay() {
    switchPlayButton();
    if ($('.playbutton').hasClass('hidden')) {
        currentlyPlaying = setInterval(playSequencer, bpmPerMilli);
    } else {
        clearInterval(currentlyPlaying);
    }
}

function handlePlayButton(){
    $('.playbutton, .stopbutton').click(togglePlay);
}

function handleBeatSelection() { 
    $('.pad').on('click', e => {
        $(event.currentTarget).toggleClass('selected');
        let currentInstrument = $(event.currentTarget).attr('data-key');
        // chaining buttons heightens pitch, odd side-effect
        // better solutions exist (see: StackOverflow) but for first iteration this is fine
        if ($(event.currentTarget).hasClass('selected')) {
            $(`audio[data-key="${currentInstrument}"]`)[0].currentTime = 0;
           $(`audio[data-key="${currentInstrument}"]`)[0].play();
        }
    });
}

function generateDrumSequencerGrid() {
    let htmlString = '';
    for (let i = 0; i < instruments.length; i++) {
         htmlString += `<div class="row instrument ${instruments[i]}"><div class="label">${instruments[i]}</div>`;
        for (let j = 0; j < beatMeasure; j++) {
            if (j % 4 === 0 && j !== 0) {
                htmlString += '<div class="divider">•</div>';
            }
            htmlString += `<button class="pad ${j}" data-key="${instruments[i]}"></button>`;
         }
         htmlString += `</div>`
    }
    return htmlString;
}

function composeSequencer(){
    $('.sequencer').empty();
    $('.sequencer').append(generateDrumSequencerGrid);
}

function handleStart() {
    composeSequencer();
    handleBeatSelection();
    handlePlayButton();
    handleReset();
}

$(handleStart);
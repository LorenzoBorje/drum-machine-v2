const beatMeasure = 16;
let bpm = 110;
let bpmPerMilli = (15000/bpm);
const instruments = ['kick', 'snare', 'hihat', 'openhat'];
let currentMeasure = 0;
let currentlyPlaying;

const SAVE = {}

const testSAVE = {
  kick: [false, true, false, true, false, true, false, false, false, false, false, false, false, false, false, false],
  snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  hihat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  openhat: [false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false]
}



function handleLoadButton(saveFile) {
  for (instrument in saveFile) {
    saveFile[instrument].forEach((pad, index) => {
      if (pad) {
        $(`.row.${instrument} > .pad:eq(${index})`).toggleClass('selected');
      }
    });
  }
}

function generatePattern() {
  instruments.forEach(instrument => {
    let pattern = [];
    for (let i = 0; i < beatMeasure; i++) {
      pattern.push(false);
    };
    SAVE[instrument] = pattern; 
  });
}

function handleSaveButton() {
  let sequence = generatePattern();
  // add event listener
}

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
        console.log(bpmPerMilli);
        currentlyPlaying = setInterval(playSequencer, bpmPerMilli);

        // could return out of the loop using new setinterval

    } else {
        clearInterval(currentlyPlaying);
    }
}

function handlePlayButton(){
    $('.playbutton, .stopbutton').click(togglePlay);
}

function playSound(currentInstrument) {
  $(`audio[data-key="${currentInstrument}"]`)[0].currentTime = 0;
  $(`audio[data-key="${currentInstrument}"]`)[0].play();
}

function handleBeatSelection() { 
  $('.pad').on('click', e => {
    let pad = $(event.currentTarget);
    let currentInstrument = pad.attr('data-key');
    let padClasses = pad.attr('class').split(' ');
    let padIndex = padClasses[1];

    pad.toggleClass('selected');
    // chaining buttons heightens pitch, odd side-effect
    // better solutions exist (see: StackOverflow) but for first iteration this is fine
    if ($(event.currentTarget).hasClass('selected')) {
      SAVE[currentInstrument][padIndex] = true;
      playSound(currentInstrument);
    } else {
      SAVE[currentInstrument][padIndex] = false;
    }
    console.log(SAVE);
  });
}

function handleLabel() {
  $('.label').on('click', e => {
    let currentInstrument = $(event.currentTarget).attr('data-key');
    playSound(currentInstrument);
  });
}

function handleTempoSelection() {
  $('#tempo').on('input', e => {
    let setTempo = $('#tempo').val();
    console.log(setTempo)
    $('.tempo').text(setTempo); 
    bpm = setTempo;
    bpmPerMilli = 15000/bpm;
  })
}

function generateDrumSequencerGrid() {
    let htmlString = '';
    let dividers = [3, 7, 11];
    for (let i = 0; i < instruments.length; i++) {
         htmlString += `<div class="row instrument ${instruments[i]}"><button class="label divider" data-key="${instruments[i]}">${instruments[i]}</button>`;
        for (let j = 0; j < beatMeasure; j++) {
            if (dividers.includes(j)) {
              htmlString += `<button class="pad ${j} divider" data-key="${instruments[i]}"></button>`;
            } else {
              htmlString += `<button class="pad ${j}" data-key="${instruments[i]}"></button>`;

            }
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
    handleLabel();
    handleBeatSelection();
    handlePlayButton();
    handleTempoSelection();
    handleReset();
    handleSaveButton();
    handleLoadButton(testSAVE);
}

$(handleStart);
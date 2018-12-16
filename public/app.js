const beatMeasure = 16;
let bpm = 110;
let bpmPerMilli = (15000/bpm);
const instruments = ['kick', 'snare', 'hihat', 'openhat'];
let currentMeasure = 0;
let currentlyPlaying;

const SAVE = {};


const testSAVE = {
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false,  false],
  snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false,  false],
  hihat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,  false],
  openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,  false]
}
function renderLoadPatternGrid(save) {
  for (instrument in save) {
    save[instrument].forEach((beat, index) => {
      if (beat) {
        $(`.load-pattern.${instrument} > .beat:eq(${index})`).toggleClass('selected');
      }
    });
  }
}

function generateLoadPatternGrid() {
  let htmlString = '';
  let dividers = [3, 7, 11];
  for (let i = 0; i < instruments.length; i++) {
       htmlString += `<div class="row load-pattern ${instruments[i]}">`;
      for (let j = 0; j < beatMeasure; j++) {
          if (dividers.includes(j)) {
            htmlString += `<button class="beat divider" data-key="${instruments[i]}"></button>`;
          } else {
            htmlString += `<button class="beat " data-key="${instruments[i]}"></button>`;

          }
       }
       htmlString += `</div>`
  }
  return htmlString;
}

function composeLoadPattern() {
  $('.pattern').empty();
  $('.pattern').append(generateLoadPatternGrid);
}

function renderLoadData() {
  console.log(responseJson);
}

function handleLoadButton() {
  $('.load-button').click(event => {
    fetch('/patterns')
    .then(response => response.json())
    .then(responseJson => console.log(responseJson));
  });
}

function renderLoadedPattern(saveFile) {
  for (instrument in saveFile) {
    saveFile[instrument].forEach((pad, index) => {
      if (pad) {
        $(`.row.${instrument} > .pad:eq(${index})`).toggleClass('selected');
      }
    });
  }
}

function generateSavePattern() {
  instruments.forEach(instrument => {
    let pattern = [];
    for (let i = 0; i < beatMeasure; i++) {
      pattern.push(false);
    };
    SAVE[instrument] = pattern; 
  });
  return SAVE;
}

function callSaveEndpoint(saveFile) {
  // $.post('/patterns', {user: "test", bpm: 110, pattern: testSAVE}
  // .done(function(data) {
  //   console.log(data);
  // });
  // })
 
  fetch('/patterns', {
    method: 'POST', // or 'PUT'
    body: JSON.stringify({
      user: 'test',
      bpm: bpm,
      pattern: saveFile
    }), // data can be `string` or {object}!
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
    .then(response => response.json())
    .then(responseJson => console.log(responseJson));

}
function handleSaveButton() {
  $('.save-button').click(event => {
    console.log(SAVE);
    callSaveEndpoint();
  });
  // add event listener
}

function resetSelected() {
    $('.row > .pad.selected').removeClass('selected');
}

function handleReset() {
    $('.resetbutton').click(resetSelected);
}

function playSound(currentInstrument) {
  $(`audio[data-key="${currentInstrument}"]`)[0].currentTime = 0;
  $(`audio[data-key="${currentInstrument}"]`)[0].play();
}

function playSequencer() {
    if (currentMeasure == 16) currentMeasure = 0;
    for (let i = 0; i < $(`.${currentMeasure}`).length; i++){
        if ($(`.${currentMeasure}:eq(${i})`).hasClass('selected')) {
            currentInstrument = $(`.${currentMeasure}:eq(${i})`).attr('data-key');
            playSound(currentInstrument);

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
    let pad = $(event.currentTarget);
    let currentInstrument = pad.attr('data-key');
    let padClasses = pad.attr('class').split(' ');
    let padIndex = padClasses[1];

    pad.toggleClass('selected');
    // chaining buttons heightens pitch, odd side-effect
    // better solutions exist (see: StackOverflow) but for first iteration this is fine
    if ($(event.currentTarget).hasClass('selected')) {
      SAVE[currentInstrument][padIndex] = true;
      console.log(SAVE);
      playSound(currentInstrument);
    } else {
      SAVE[currentInstrument][padIndex] = false;
      console.log(SAVE);
    }
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

function composeSequencer() {
  $('.sequencer').empty();
    $('.sequencer').append(generateDrumSequencerGrid);
}

function addEventListeners() {
  handleLabel();
  handleBeatSelection();
  handlePlayButton();
  handleTempoSelection();
  handleReset();
  handleSaveButton();

}


function handleStart() {
    composeSequencer();
    generateSavePattern();
    addEventListeners();
    composeLoadPattern();
    renderLoadedPattern(testSAVE);
    renderLoadPatternGrid(testSAVE);
    handleLoadButton(testSAVE);
}

$(handleStart);
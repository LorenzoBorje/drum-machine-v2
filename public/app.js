let bpm = 110;
let bpmPerMilli = (15000/bpm);
const instruments = ['kick', 'snare', 'hihat', 'openhat'];
let currentMeasure = 0;
let currentlyPlaying;
let saved = false;
let id = '';

const CONFIG = {
  beatMeasure: 16,
  bpm: 110,
  bpmPerMilli: (15000/this.bpm),
  instruments: ['kick', 'snare', 'hihat', 'openhat'],
  currentMeasure: 0,
  currentlyPlaying: false,
  saved: false,
  id: '',
  user: '',
  title: '',
  SAVE: '',
  token: ''
}

let SAVE = {};

// 

function handleLoadPatternButton() {
  $('.load-pattern-button').click(event => {
    let pattern = $(event.currentTarget);
    let patternClasses = pattern.attr('class').split(' ');
    let patternID = patternClasses[2];
    callLoadEndpoint(patternID);
  });
}

function generateLoadPatternGrid(pattern) {
  let htmlString = '';
  for (instrument in pattern) {
    htmlString += `<div class="row load-pattern ${instrument}">`;
    for (let i = 0; i < CONFIG.beatMeasure; i++) {
      if (pattern[instrument][i]) {
  
        htmlString += `<button class="beat selected" data-key="${instruments[i]}"></button>`;
      } else {
        htmlString += `<button class="beat" data-key="${instruments[i]}"></button>`
      }
    } 
    htmlString += `</div>`
  }

  return htmlString;
}

function renderLoadedPattern(responseJson) {
  bpm = responseJson.bpm;
  id = responseJson.id;
  saved = true;
  let saveFile = responseJson.pattern;
  SAVE = saveFile;
  resetSelected()
  for (instrument in saveFile) {
    saveFile[instrument].forEach((pad, index) => {
      if (pad) {
        $(`.row.${instrument} > .pad:eq(${index})`).toggleClass('selected');
      }
    });
  }
}

function generateLoadHTMLString(pattern) {
return `<article class="save-pattern"><p class="title">${pattern.title}</p><div class="pattern">${generateLoadPatternGrid(pattern.pattern)}</div><p class="bpm">${pattern.bpm}bpm<p><p class="author">${pattern.user}</p><p class="date">${pattern.created}</p><button class="load-pattern-button save-load ${pattern.id}">Load</button><button class="delete-pattern-button save-load ${pattern.id}">Delete</button></article>`
}

function renderLoadData(responseJson) {
  $('.load').empty();
  responseJson.forEach(pattern => {
    $('.load').append(generateLoadHTMLString(pattern));
  });
}

function handleDeletePatternButton() {
  $('.delete-pattern-button').click(ebent => {
    let pattern = $(event.currentTarget);
    let patternClasses = pattern.attr('class').split(' ');
    let patternID = patternClasses[2];
    if (patternID == id) {
      saved = false;
    } 
    callDeleteEndpoint(patternID);
  })
}

function callDeleteEndpoint(patternID) {
  fetch(`/patterns/${patternID}`, {
    method: 'DELETE'
  })
  .then(response => console.log('Succesfully deleted!'))
  .then(() => callLoadEndpoint())
  .catch(err => console.error(err));
}

function callLoadEndpoint(patternID) {
  let options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': '',
      'Host': 'api.producthunt.com',
      'Authorization': CONFIG.token
    }
  };
  if (patternID) {
    fetch(`/user/patterns/${patternID}`, options)
    .then(response => response.json())
    .then(responseJson => renderLoadedPattern(responseJson));
  } else {
    fetch(`/user/${CONFIG.user}/patterns`, options)
    .then(response => response.json())
    .then(responseJson => renderLoadData(responseJson))
    .then(() => {
      handleLoadPatternButton();
      handleDeletePatternButton();
    });
  }
}

function handleLoadButton() {
  $('.load-button').click(event => {
    callLoadEndpoint();
  });
}

function generateSavePattern() {
  instruments.forEach(instrument => {
    let pattern = [];
    for (let i = 0; i < CONFIG.beatMeasure; i++) {
      pattern.push(false);
    };
    SAVE[instrument] = pattern; 
  });
  return SAVE;
}

function callUpdateEndpoint(saveFile, public) {
  fetch(`/patterns/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      id: id,
      bpm: bpm,
      pattern: saveFile
    }),
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => console.log('Successfully updated'))
  .then(() => callLoadEndpoint())
  .catch(err => {
    console.error(err);
    console.error('Internal server error');
  });
}

function updatePatternInfo(responseJson) {
  let feedback = $('.save-feedback');
  saved = true;
  id = responseJson.id;
  feedback.empty();
  feedback.append(`Saved successfully as ${responseJson.title}`)
  feedback.removeClass('hidden');
}

function callSaveEndpoint(saveFile) {

  fetch('/patterns', {
    method: 'POST',
    body: JSON.stringify({
      user: CONFIG.user,
      bpm: bpm,
      pattern: saveFile
    }),
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
    .then(response => response.json())
    .then(responseJson => updatePatternInfo(responseJson))
    .then(() => callLoadEndpoint())
    .catch(err => console.error('Save failed.'))

}
function handleSaveButton() {
  $('.save-button').click(event => {
    if (!saved) {
      callSaveEndpoint(SAVE);
    } else {
      callUpdateEndpoint(SAVE);
    }
  });
  // add event listener
}

function resetSelected() {
    $('.row > .pad.selected').removeClass('selected');
}

function handleReset() {
    $('.resetbutton').click(e => {
      resetSelected();
      saved = false;
      id = '';
    })
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
    if ($(event.currentTarget).hasClass('selected')) {
      SAVE[currentInstrument][padIndex] = true;
      playSound(currentInstrument);
    } else {
      SAVE[currentInstrument][padIndex] = false;
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
  $('#tempo').val("110");
  $('#tempo').on('input', e => {
    let setTempo = $('#tempo').val();
    bpm = setTempo;
    bpmPerMilli = 15000/bpm;
  })
}

function generateDrumSequencerGrid() {
    let htmlString = '';
    let dividers = [3, 7, 11];
    for (let i = 0; i < instruments.length; i++) {
         htmlString += `<div class="row instrument ${instruments[i]}"><button class="label divider" data-key="${instruments[i]}">${instruments[i]}</button>`;
        for (let j = 0; j < CONFIG.beatMeasure; j++) {
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

function setTokenAndUser(responseJson, user){
  CONFIG.token = responseJson.token;
  CONFIG.user = user.userName;
}

function callLoginEndpoint(user) {
  fetch('/login', {
    method: 'POST',
    body: JSON.stringify({
      userName: user.userName,
      password: user.password
    }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(responseJson => setTokenAndUser(responseJson, user))
  .then(() => closeSideNav())
  .catch(err => console.error(err));
}

function callSignUpEndpoint(user) {
  fetch('/signup', {
    method: 'POST',
    body: JSON.stringify({
      userName: user.userName,
      password: user.password
    }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => callLoginEndpoint(user));
}

function handleShareButton() {
  $('.share-button').click(event => {
    if (saved) {
      callUpdateEndpoint
    }
  })
}

function handleSignUp() {
  $('#register-button').click(event => {
    event.preventDefault();
    let userName = $('#user-name').val();
    let password = $('#pass-word').val();
    let user = {userName: userName, password: password};
    callSignUpEndpoint(user);
  })
}

function handleLogIn() {
  $('#log-in-button').click(event => {
    event.preventDefault();
    let userName = $('#user-name').val();
    let password = $('#pass-word').val();
    let user = {userName: userName, password: password};
    callLoginEndpoint(user);
  })
}

function openSideNav() {
  $(".sidenav").width(350);
  $("main").css('margin-left', '390px');
  $(".sidenav").css('padding', '20px');
}

function closeSideNav() {
  $(".sidenav").width(0);
  $("main").css('margin-left', '0');
  $(".sidenav").css('padding', '0');

}


function addEventListeners() {
  handleSignUp();
  handleLogIn();
  handleLabel();
  handleBeatSelection();
  handlePlayButton();
  handleTempoSelection();
  handleLoadButton();
  handleReset();
  handleSaveButton();
  handleShareButton();
}


function handleStart() {
    composeSequencer();
    generateSavePattern();
    addEventListeners();
    openSideNav();
}

$(handleStart);

import {addDonateur, initDonateur, addLikes, canSpeak} from "./dontateurs.js";
import LocalStorage from "./LocalStorage.js";
let localStorage
// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
let backendUrl =  "https://tiktok-chat-reader.zerody.one/" ;
let connection = new TikTokIOConnection(backendUrl);

// Counter
let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0;
let voices;
let text;

//voices
const defaultComLang = 9 //french google
let selectComVoice = document.querySelector("#selectComVoice")
let volumeCom = document.querySelector("#volumeCom")
let rateCom = document.querySelector("#rateCom")
let pitchCom = document.querySelector("#pitchCom")

!"speechSynthesis" in window
    ? alert("La synthese vocale ne fonctionn pas sur votre navigateur. Essayez d'utiliser la derniere version de Chrome")
    : console.log("Web Speech API is supported :-(")
window.speechSynthesis.onvoiceschanged = () =>{ 
    console.log('voices are ready',window.speechSynthesis.getVoices())
    voices = window.speechSynthesis.getVoices()
    voices.map((voice, id) => {
        const option = document.createElement("option")
        option.value = id
        option.innerHTML = voice.name
        // if (id == defaultComLang) option.selected = true
        selectComVoice.appendChild(option)
    })
     localStorage = new LocalStorage
}; 

$(document).ready(() => {
    $('#connectButton').click(connect);
    $('#uniqueIdInput').on('keyup', function (e) {
        if (e.key === 'Enter') {
            connect();
        }
    });

    // if (window.settings.username) connect();
    
})
////////////////////////////////////////////////////////////////
      document.querySelector("#cancel_sound").addEventListener("click", function(e){
        window.speechSynthesis.cancel()
      })

////////////////////////////////
function connect() {
    let uniqueId = $('#uniqueIdInput').val();
    if (uniqueId !== '') {

        $('#stateText').text('Connecting...');

        connection.connect(uniqueId, {
            enableExtendedGiftInfo: true
        }).then(state => {

            $('#stateText').text(`Connected to roomId ${state.roomId}`);
           
            // reset stats
            viewerCount = 0;
            likeCount = 0;
            diamondsCount = 0;
            updateRoomStats();

        }).catch(errorMessage => {
            $('#stateText').text(errorMessage);

        })

    } else {
        alert('no username entered');
    }
}

function stripEmojis (str){
     return str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}
// Prevent Cross site scripting (XSS)
function sanitize(text) {
    return stripEmojis(text.replace(/</g, '&lt;').replace('.',' ').replace('_',' ').replace('/',' ').replace('joined',''))
}

function canGiftThanks(){
    return document.querySelector("#giftThanks").checked
}
function addUsername(){
    return document.querySelector("#addUsername").checked
}

function updateRoomStats() {
    $('#roomStats').html(`Spectateurs: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Diamants récoltés: <b>${diamondsCount.toLocaleString()}</b>`)
}

function generateUsernameLink(data) {
    return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
}

function isPendingStreak(data) {
    return data.giftType === 1 && !data.repeatEnd;
}

/**
 * Add a new message to the chat container
 */
function addChatItem(color, data, text, summarize) {
    let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.chatcontainer');
    // console.log(data) 
    // 6757718079318623237
    if (container.find('div').length > 500) {
        container.find('div').slice(0, 200).remove();
    }

    container.find('.temporary').remove();;

    container.append(`
        <div class=${summarize ? 'temporary' : 'static'}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> 
                <span style="color:${color}">${sanitize(text)}</span>
            </span>
        </div>
    `);

    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 400);

    if(text.includes("@stop") && data.isModerator){
        document.querySelector("#onlyModeratorCheckbox").checked = false
        window.speechSynthesis.cancel();
    }else if(text.includes("@start") && data.isModerator){
        document.querySelector("#onlyModeratorCheckbox").checked = true
    } 
    
   
    else if(canSpeak(data) && !text.includes('joined')){
        if(!text.includes('joined')){
            if(addUsername()) {
                text =  text + " %n"
                text = text.replace("%n", data.uniqueId);
            }
        }else{
            text= ""
        }
       
       speakUser(text)
    }
}

/**
 * Add a new gift to the gift container
 */
function addGiftItem(data) {
    let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.giftcontainer');

    if (container.find('div').length > 200) {
        container.find('div').slice(0, 100).remove();
    }

    let streakId = data.userId.toString() + '_' + data.giftId;

    let html = `
        <div data-streakid=${isPendingStreak(data) ? streakId : ''}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> <span>${data.describe}</span><br>
                <div>
                    <table>
                        <tr>
                            <td><img class="gifticon" src="${data.giftPictureUrl}"></td>
                            <td>
                                <span>Name: <b>${data.giftName}</b> (ID:${data.giftId})<span><br>
                                <span>Repeat: <b style="${isPendingStreak(data) ? 'color:red' : ''}">x${data.repeatCount.toLocaleString()}</b><span><br>
                                <span>Cost: <b>${(data.diamondCount * data.repeatCount).toLocaleString()} Diamonds</b><span>
                            </td>
                        </tr>
                    </tabl>
                </div>
            </span>
        </div>
    `;

    let existingStreakItem = container.find(`[data-streakid='${streakId}']`);

    if (existingStreakItem.length) {
        existingStreakItem.replaceWith(html);
    } else {
        container.append(html);
    }

    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 800);


      if (!isPendingStreak(data)  ) {
            if(canGiftThanks()){
                text =  "merci %n";
                text = text.replace("%n", data.uniqueId);
                speakUser(text)
            }
           
    
        addDonateur(data)

    }
}


// viewer stats
connection.on('roomUser', (msg) => {
    if (typeof msg.viewerCount === 'number') {
        viewerCount = msg.viewerCount;
        updateRoomStats();
    }
})

// like stats
connection.on('like', (msg) => {
    if (typeof msg.totalLikeCount === 'number') {
        likeCount = msg.totalLikeCount;
        updateRoomStats();
    }

    if (typeof msg.likeCount === 'number') { 
        addLikes(msg)
        // addChatItem('#447dd4', msg, msg.label.replace('{0:user}', '').replace('likes', `${msg.likeCount} likes`))
    }
})

// Member join
let joinMsgDelay = 0;
connection.on('member', (msg) => {
    let addDelay = 250;
    if (joinMsgDelay > 500) addDelay = 100;
    if (joinMsgDelay > 1000) addDelay = 0;

    joinMsgDelay += addDelay;

    setTimeout(() => {
        joinMsgDelay -= addDelay;
        initDonateur(msg)
        addChatItem('#21b2c2', msg, 'joined', true);
    }, joinMsgDelay);

   
})

// New chat comment received
connection.on('chat', (msg) => {

    addChatItem('', msg, msg.comment);
})

// New gift received
connection.on('gift', (data) => {
    if (!isPendingStreak(data) && data.diamondCount > 0) {
        diamondsCount += (data.diamondCount * data.repeatCount);
        updateRoomStats();
    }

    addGiftItem(data);
})

// share, follow
connection.on('social', (data) => {

    let color = data.displayType.includes('follow') ? '#ff005e' : '#2fb816';
    // addChatItem(color, data, data.label.replace('{0:user}', ''));
})

connection.on('streamEnd', () => {
    $('#stateText').text('Stream ended.');

})

document.querySelector("#textToSpeechInput").addEventListener("keydown", (event) => {
    // console.log(event.keyCode)
    if ( event.keyCode === 13) {
        const txt = document.querySelector("#textToSpeechInput").value
        speakAdmin (txt)
      }
})
document.querySelector("#textToSpeechButton").addEventListener("click", async () => {
   const txt = document.querySelector("#textToSpeechInput").value
   speakAdmin (txt)            
})

function speakAdmin (text){
    var msg = new SpeechSynthesisUtterance();  
    msg.voice = voices[2]; 
    msg.volume = 1; // From 0 to 1
    msg.rate = 0.8; // From 0.1 to 10
    msg.pitch = 0; // From 0 to 2
    // msg.lang = 'fr';
    msg.text = text

    window.speechSynthesis.speak(msg);
}

export function speakUser(text){
    var msg = new SpeechSynthesisUtterance();  
    msg.voice = voices[parseInt(selectComVoice.value)]; 
      msg.volume = parseFloat(volumeCom.value, 1); // From 0 to 1
      msg.rate = parseFloat(rateCom.value, 1); // From 0.1 to 10
      msg.pitch = parseFloat(pitchCom.value,1); // From 0 to 2
    //   msg.lang = 'fr';
      msg.text = sanitize(text) ;
    console.log(msg)
    window.speechSynthesis.speak(msg);
}

// compte à rebours
let minutes = 0;
    let seconds = 0;
    let countdown;
    
    const decrementMinutesBtn = document.getElementById('decrementMinutes');
    const incrementMinutesBtn = document.getElementById('incrementMinutes');
    const decrementSecondsBtn = document.getElementById('decrementSeconds');
    const incrementSecondsBtn = document.getElementById('incrementSeconds');
    const startBtn = document.getElementById('start');
    
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    
    decrementMinutesBtn.addEventListener('click', () => {
      if (minutes > 0) {
        minutes--;
        minutesDisplay.textContent = minutes;
      }
    });
    
    incrementMinutesBtn.addEventListener('click', () => {
      minutes++;
      minutesDisplay.textContent = minutes;
    });
    
    decrementSecondsBtn.addEventListener('click', () => {
      if (seconds > 0) {
        seconds--;
        secondsDisplay.textContent = seconds;
      }
    });
    
    incrementSecondsBtn.addEventListener('click', () => {
      seconds++;
      secondsDisplay.textContent = seconds;
    });
    
    startBtn.addEventListener('click', () => {
      clearInterval(countdown);
      countdown = setInterval(updateCountdown, 1000);
    });
    
    function updateCountdown() {
      if (minutes === 0 && seconds === 0) {
        clearInterval(countdown);
        playSound();
        return;
      }
      
      if (seconds === 0) {
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }
      
      minutesDisplay.textContent = minutes;
      secondsDisplay.textContent = seconds;
    }
    
    function playSound() {
      const audio = new Audio('./assets/sounds/wc.mp3'); // Remplacez 'path/to/sound/file.mp3' par le chemin de votre fichier audio
      audio.play();
    }
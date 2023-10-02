import {speakUser} from "./app.js"
let donateurs = {}
const donateursContainer = document.querySelector(".donateurcontainer")
const likeContainer = document.querySelector(".likecontainer")

export function addDonateur(data){
    const userId = data.userId

    if (userId in donateurs){
        donateurs[userId]["diamondCount"] +=  parseInt(data.diamondCount) *parseInt(data.repeatCount ) 
    }else{
        donateurs[userId] = {
          "diamondCount" : parseInt(data.diamondCount)  *parseInt(data.repeatCount ),
          "likes" : 0,
          "nickname": data.nickname,
          "profilePictureUrl" : data.profilePictureUrl,
          "userId": userId
        } 
    }
    updateDonateurList(userId)
}
export function addLikes(data){
    const userId = data.userId

    if (userId in donateurs){
        donateurs[userId]["likes"] +=  data.likeCount
    }else{
        donateurs[userId] = {
          "diamondCount" : 0,
          "likes" : data.likeCount,
          "nickname": data.nickname,
          "profilePictureUrl" : data.profilePictureUrl,
          "userId": userId
        } 
    }
    updateLikerList(userId)
}

export function initDonateur(data){
    const userId = data.userId

    if (!userId in donateurs){
        donateurs[userId] = {
            "diamondCount" : 0,
            "likes" : 0,
            "nickname": data.nickname,
            "profilePictureUrl" : data.profilePictureUrl,
            "userId": userId
          }
    }

    updateDonateurList(userId)
    updateLikerList(userId)
}


function updateDonateurList(userId){
    // console.log(donateurs)
    let donateursArray = Object.values(donateurs)
    donateursArray.sort((a, b) => b.diamondCount - a.diamondCount);
    donateursContainer.innerHTML="" 
    let html ='<h3 class="containerheader">liste des donateurs</h3>'
    donateursArray.forEach((data, id)=>{
        const order = id +1 
        const img = `<img class="medailleicon" src="./assets/images/${order}.png">`
         html += `
            <div class="rankItem">
            <b class="order">${ [1,2,3].includes(order) ? img : order }</b>
                <img class="profileicon" src="${data.profilePictureUrl}">
                <span>
                    <b>${generateUsernameLink(data)}:</b> 
                    <span class="rankScore ${data.userId == userId? 'transition-text' : ''}" >${data.diamondCount}</span>
                </span>
            </div>
        `;
        
    })
    donateursContainer.innerHTML = html
}
function updateLikerList(userId){
    // console.log(donateurs)
    let likesArray = Object.values(donateurs)
    likesArray.sort((a, b) => b.likes - a.likes);

    likeContainer.innerHTML = ""
    let html= '<h3 class="containerheader">liste des likes</h3>'
    likesArray.forEach((data, id)=>{
        const order = id +1 
        const img = `<img class="medailleicon" src="./assets/images/${order}.png">`
         html += `
            <div class="rankItem">
                <b class="order">${ [1,2,3].includes(order) ? img : order }</b>
                <img class="profileicon" src="${data.profilePictureUrl}">
                <span >
                    <b>${generateUsernameLink(data)}:</b> 
                    <span class="rankScore ${data.userId == userId? 'transition-text' : ''}" >${data.likes}</span>
                    <button type="button"  data-nickname="${data.nickname}" data-countlike=${data.likes}><img width="20px" src="./assets/images/speaker.png"></button>
                </span>
            </div>
        `;
        
    })
    likeContainer.innerHTML = html

    likeContainer.querySelectorAll(".rankItem button").forEach(element =>{
        
        const nickname = element.dataset.nickname
        const likes = element.dataset.countlike
        element.addEventListener("click", (e =>{
            e.preventDefault();
            e.stopPropagation();
            speakUser(`Merci ${nickname} pour tes ${likes} tapotages`)
        }))
        
    })
}

function generateUsernameLink(data) {
    return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.nickname}</a>`;
}

export function canSpeak(data){
    const selected = document.querySelector('input[name="canSpeak"]:checked')

            const canSpeak = selected.value;
            if(canSpeak === "all"){
                return true;
            } 
            else if (canSpeak === "moderators"){
                return data.isModerator 
            }else if (canSpeak === "friends") {
                return data.rollowRole == 2
            }else if (canSpeak === "followers") {
                return data.rollowRole == 1
            }else if (canSpeak === "premium") {
                return data.isSubscriber
            }else if (canSpeak === "donators") {
                const userId = data.userId
                let donateursArray = Object.values(donateurs)
                donateursArray.sort((a, b) => b.diamondCount - a.diamondCount);
                return userId in donateursArray.slice(0, 3);
            }
            return false
            
   
}


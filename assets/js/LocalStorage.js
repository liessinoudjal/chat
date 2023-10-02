function getUserVoiceParams(){
    return JSON.parse(window.localStorage.getItem("userVoiceParams") || "{}")
}

function setUserVoiceParams(userVoiceParams){
    window.localStorage.setItem("userVoiceParams", JSON.stringify(userVoiceParams))
}

export default class LocalStorage {
    constructor(){
        this.userVoiceParams = getUserVoiceParams()
        console.log(this.userVoiceParams )
        if (Object.keys(this.userVoiceParams).length === 0){
            this.userVoiceParams = {
                "selectComVoice" : 9,
                "volumeCom" : 1,
                "rateCom": 1.2,
                "pitchCom" : 1
            }
            setUserVoiceParams(this.userVoiceParams)
        }
        document.querySelectorAll(".storageable").forEach(input =>{
            const id = input.getAttribute("id");
            
            input.value = this.userVoiceParams[id]
            console.log(input)
        })

        document.querySelectorAll(".storageable").forEach(input =>{
                input.addEventListener("change", e =>{
                this.userVoiceParams = getUserVoiceParams()
                const id = e.target.getAttribute("id")
                const value = e.target.value
                this.userVoiceParams[id] = value
                setUserVoiceParams(this.userVoiceParams)
            })
        })
    }
}
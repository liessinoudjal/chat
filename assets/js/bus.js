// Tableau contenant les fichiers audio à lire
let audioFiles = [
  ];
  
  // Établir une connexion avec le message bus
  const messageBus = new BroadcastChannel('audioPlayer');
  
  // Fonction pour lire un fichier audio spécifié par son index
  function playAudioFile() {
    if(audioFiles.length > 0){
        console.log(audioFiles)
        const audio = document.querySelector(`#${audioFiles[0]}`);
        audio.play();
        
        // Lorsque l'audio est terminé, envoyer un message au message bus pour lire le fichier audio suivant
        audio.addEventListener('ended', () => {
        audioFiles.splice(0,1)
        playSound();
    });
    }
   
  }
  
  // Fonction pour démarrer la lecture des fichiers audio
  export function playSound(fileName) {
    // Commencer par la première piste
    
    if(audioFiles.length == 0){
        audioFiles.push(fileName)
        playAudioFile();
    }else{
        audioFiles.push(fileName)
    }
    
  }
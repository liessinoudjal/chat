export default class AudioQueue {
    constructor() {
      this.queue = [];
      this.currentAudio = null;
    }
  
    enqueue(audio) {
      this.queue.push(audio);
      if (this.currentAudio === null) {
        this.playNext();
      }
    }
  
    playNext() {
      if (this.queue.length === 0) {
        this.currentAudio = null;
        return;
      }
      this.currentAudio = this.queue.shift();
      this.currentAudio.play();
      this.currentAudio.addEventListener('ended', () => {
        this.playNext();
      });
    }
  }
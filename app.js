App({
  onLaunch() {
    console.log('App Launching...');
    
    // 初始化音效
    this.clickAudio = wx.createInnerAudioContext();
    this.clickAudio.src = '/audio/click.wav';
    
    this.tickAudio = wx.createInnerAudioContext();
    this.tickAudio.src = '/audio/tick.wav';
    
    this.revealAudio = wx.createInnerAudioContext();
    this.revealAudio.src = '/audio/reveal.wav';
    
    this.coinAudio = wx.createInnerAudioContext();
    this.coinAudio.src = '/audio/coin.wav';
    
    this.tadaAudio = wx.createInnerAudioContext();
    this.tadaAudio.src = '/audio/tada.wav';
  },
  
  playClick() {
    this.clickAudio.stop();
    this.clickAudio.play();
  },
  
  playTick() {
    this.tickAudio.stop();
    this.tickAudio.play();
  },
  
  playReveal() {
    this.revealAudio.stop();
    this.revealAudio.play();
  },
  
  playCoin() {
    this.coinAudio.stop();
    this.coinAudio.play();
  },
  
  playTada() {
    this.tadaAudio.stop();
    this.tadaAudio.play();
  },

  globalData: {
    marukoImages: [
      "微信图片_20260327154056_935_17.jpg",
      "微信图片_20260327154057_936_17.jpg",
      "微信图片_20260327154109_941_17.jpg"
    ]
  }
})

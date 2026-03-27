Page({
  data: {
    currentCharacter: '',
    animationClass: '',
    showGreeting: false
  },

  onLoad() {
    // Pick a random character from global pool
    const images = getApp().globalData.marukoImages;
    const randIndex = Math.floor(Math.random() * images.length);
    this.setData({
      currentCharacter: images[randIndex]
    });
  },

  onShow() {
    // Start animation slightly after show
    setTimeout(() => {
      this.setData({ animationClass: 'pop-out' });
      wx.vibrateShort({ type: 'medium' }); // Haptic feedback on pop
    }, 150);

    // Show greeting after pop out
    setTimeout(() => {
      this.setData({ showGreeting: true });
    }, 900);

    // Auto redirect to main page after 3 seconds total
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/eat/eat'
      });
    }, 2800);
  }
})

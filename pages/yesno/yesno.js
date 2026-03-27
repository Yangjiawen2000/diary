const app = getApp();

Page({
  data: {
    flipping: false,
    result: null // 'Yes' or 'No'
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  flipCoin() {
    if (this.data.flipping) return;
    
    app.playCoin(); // Play metallic coin flip spin
    wx.vibrateShort({ type: 'light' });
    
    // Reset result and start flipping
    this.setData({
      flipping: true,
      result: null
    });
    
    // Determine the result
    const isYes = Math.random() > 0.5;
    const finalResult = isYes ? 'Yes' : 'No';

    setTimeout(() => {
      this.setData({
        flipping: false,
        result: finalResult
      });
      
      // Heavy haptic and reveal sound when coin drops
      app.playReveal();
      wx.vibrateHeavy();
    }, 1500);
  }
})

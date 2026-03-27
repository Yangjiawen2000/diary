const app = getApp();

const defaultFoods = [
  '火锅🍲', '烤肉🥩', '麦当劳🍔', '肯德基🍟', '麻辣烫🍢', '黄焖鸡🍗',
  '沙县小吃🥟', '兰州拉面🍜', '披萨🍕', '日料🍣', '粤菜🥠', '川菜🌶️',
  '轻食沙拉🥗', '饺子🥟', '螺蛳粉🍜', '炒饭🍚', '米线🍜', '炸鸡🍗',
  '烤鱼🐟', '牛排🥩', '东北菜🥘', '小龙虾🦞', '粥铺🥣', '汉堡王🍔'
];

Page({
  data: {
    currentFood: '???',
    isRolling: false,
    foods: []
  },

  timer: null,

  onLoad() {
    this.initFoods();
  },

  onShow() {
    this.initFoods(); // Refresh in case user changes it in settings later
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  initFoods() {
    const localFoods = wx.getStorageSync('custom_foods');
    if (localFoods && localFoods.length > 0) {
      this.setData({ foods: localFoods });
    } else {
      this.setData({ foods: defaultFoods });
    }
  },

  startRoll() {
    if (this.data.isRolling) {
      this.stopRoll();
    } else {
      // Start rolling
      app.playClick();
      this.setData({
        isRolling: true,
        currentFood: '...'
      });
      wx.vibrateShort({ type: 'light' });

      let tickCount = 0;
      this.timer = setInterval(() => {
        tickCount++;
        const randomIndex = Math.floor(Math.random() * this.data.foods.length);
        this.setData({
          currentFood: this.data.foods[randomIndex]
        });

        // don't spam audio engine
        if (tickCount % 2 === 0) {
          app.playTick();
        }

        // Auto stop after about 1.8 seconds if user didn't manually stop
        if (tickCount >= 30 && this.data.isRolling) {
          this.stopRoll();
        }
      }, 60); // Change every 60ms
    }
  },

  stopRoll() {
    if (!this.data.isRolling) return;

    clearInterval(this.timer);
    this.setData({ isRolling: false });

    // Save to local storage for the diary
    const d = new Date();
    const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    wx.setStorageSync('today_food', { date: today, name: this.data.currentFood });

    try {
      app.playTada();
    } catch (e) { console.error('Audio play error', e); }

    setTimeout(() => {
      try {
        wx.vibrateHeavy();
      } catch (e) { console.error('Vibrate error', e); }
    }, 50);
  },

  onHide() {
    if (this.timer) {
      clearInterval(this.timer);
      this.setData({ isRolling: false });
    }
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/list/list?type=eat'
    });
  }
})

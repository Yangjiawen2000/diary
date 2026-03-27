const app = getApp();

const defaultActivities = [
  '看一场老电影 🎬', '去附近公园散步 🌳', '做一次大扫除 🧹',
  '读30分钟书 📖', '去喝杯咖啡 ☕', '听一首没听过的歌 🎵',
  '整理手机相册 📱', '冥想10分钟 🧘', '给老朋友发微信 💬',
  '玩一局游戏 🎮', '做一组伸展运动 🤸', '发呆20分钟 😶',
  '看一部纪录片 📺', '去超市逛逛 🛒', '早点睡觉 💤'
];

Page({
  data: {
    isFlipped: false,
    currentActivity: '???',
    activities: []
  },

  onLoad() {
    this.initActivities();
  },

  onShow() {
    this.initActivities();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  initActivities() {
    const localActivities = wx.getStorageSync('custom_activities');
    if (localActivities && localActivities.length > 0) {
      this.setData({ activities: localActivities });
    } else {
      this.setData({ activities: defaultActivities });
    }
  },

  flipCard() {
    if (this.data.isFlipped) return; // Prevent double clicking

    app.playClick();
    wx.vibrateShort({ type: 'light' });

    this.setData({
      isFlipped: true,
      currentActivity: '...'
    });
    // Pick a random activity
    const randomIndex = Math.floor(Math.random() * this.data.activities.length);
    const finalActivity = this.data.activities[randomIndex];

    // Simulate rolling while flipping
    let rollCount = 0;
    const rollTimer = setInterval(() => {
      rollCount++;
      const rand = Math.floor(Math.random() * this.data.activities.length);
      this.setData({ currentActivity: this.data.activities[rand] });
      app.playTick();

      if (rollCount > 10) {
        clearInterval(rollTimer);
        this.setData({ currentActivity: finalActivity });

        // Save to local storage for the diary
        const d = new Date();
        const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        wx.setStorageSync('today_do', { date: today, name: finalActivity });

        try { app.playReveal(); } catch (e) { }
        try { wx.vibrateHeavy(); } catch (e) { }
      }
    }, 60); // 10 ticks = 600ms
  },

  resetCard() {
    app.playClick();
    this.setData({
      isFlipped: false
    });
    // Clear content after animation ends to hide it while flipping back
    setTimeout(() => {
      this.setData({ currentActivity: '' });
    }, 400);
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/list/list?type=do'
    });
  }
})

const app = getApp();

Page({
  data: {
    streak: 0,
    totalDiaries: 0,
    moodStats: []
  },

  onShow() {
    this.calculateStats();
  },

  calculateStats() {
    const list = wx.getStorageSync('diary_list') || [];
    if (list.length === 0) {
      this.setData({ streak: 0, totalDiaries: 0, moodStats: [] });
      return;
    }

    // 1. Total count
    const totalDiaries = list.length;

    // 2. Streak calculation
    const streak = this.getStreak(list);

    // 3. Mood distribution
    const moodCounts = {};
    list.forEach(item => {
      if (item.mood) {
        moodCounts[item.mood.emoji] = (moodCounts[item.mood.emoji] || 0) + 1;
      }
    });

    const moodStats = Object.keys(moodCounts).map(emoji => ({
      emoji,
      count: moodCounts[emoji],
      percent: (moodCounts[emoji] / totalDiaries) * 100
    })).sort((a, b) => b.count - a.count);

    this.setData({ streak, totalDiaries, moodStats });
  },

  getStreak(list) {
    if (list.length === 0) return 0;
    
    // Sort by timestamp descending
    const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique dates
    const dates = [...new Set(sorted.map(item => {
      const d = new Date(item.timestamp);
      return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }))];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;

    // If last entry isn't today or yesterday, streak is 0
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i+1]);
      const diffDays = Math.round((current - next) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  goBack() {
    app.playClick();
    wx.navigateBack();
  }
})

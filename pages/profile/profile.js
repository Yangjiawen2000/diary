const app = getApp();

Page({
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
  },

  goToStats() {
    app.playClick();
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  clearData() {
    app.playClick();
    wx.showModal({
      title: '警告',
      content: '确定要清除所有本地数据吗？（包含日记和自定义列表）',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '清除成功', icon: 'success' });
        }
      }
    });
  }
})

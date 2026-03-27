Page({
  data: {
    historyList: []
  },
  
  onShow() {
    this.loadHistory();
  },
  
  loadHistory() {
    const diaries = wx.getStorageSync('diaries') || {};
    const list = [];
    
    // Convert object to array
    for (const dateKey in diaries) {
      const data = diaries[dateKey];
      if (typeof data === 'string') {
        // Backwards compatibility for old saved diaries
        list.push({
          date: dateKey,
          text: data,
          timestamp: new Date(dateKey.replace(/-/g, '/')).getTime() // iOS safe parsing
        });
      } else if (data) {
        list.push({
          date: dateKey,
          ...data
        });
      }
    }
    
    // Sort descending (newest first)
    list.sort((a, b) => b.timestamp - a.timestamp);
    
    this.setData({ historyList: list });
  }
})

const defaultFoods = [
  '火锅🍲', '烤肉🥩', '麦当劳🍔', '肯德基🍟', '麻辣烫🍢', '黄焖鸡🍗',
  '沙县小吃🥟', '兰州拉面🍜', '披萨🍕', '日料🍣', '粤菜🥠', '川菜🌶️',
  '轻食沙拉🥗', '饺子🥟', '螺蛳粉🍜', '炒饭🍚', '米线🍜', '炸鸡🍗',
  '烤鱼🐟', '牛排🥩', '东北菜🥘', '小龙虾🦞', '粥铺🥣', '汉堡王🍔'
];

const defaultActivities = [
  '看一场老电影 🎬', '去附近公园散步 🌳', '做一次大扫除 🧹', 
  '读30分钟书 📖', '去喝杯咖啡 ☕', '听一首没听过的歌 🎵',
  '整理手机相册 📱', '冥想10分钟 🧘', '给老朋友发微信 💬',
  '玩一局游戏 🎮', '做一组伸展运动 🤸', '发呆20分钟 😶',
  '看一部纪录片 📺', '去超市逛逛 🛒', '早点睡觉 💤'
];

Page({
  data: {
    type: 'eat', // 'eat' or 'do'
    pageTitle: '',
    placeholderText: '',
    items: [],
    inputValue: ''
  },

  onLoad(options) {
    const type = options.type || 'eat';
    let pageTitle = type === 'eat' ? '美食列表' : '活动列表';
    let placeholderText = type === 'eat' ? '菜品或餐厅' : '选项或活动';
    
    this.setData({
      type,
      pageTitle,
      placeholderText
    });

    wx.setNavigationBarTitle({ title: pageTitle });
    
    this.loadData();
  },

  loadData() {
    const storageKey = this.data.type === 'eat' ? 'custom_foods' : 'custom_activities';
    const defaultData = this.data.type === 'eat' ? defaultFoods : defaultActivities;
    
    const localData = wx.getStorageSync(storageKey);
    if (localData && localData.length > 0) {
      this.setData({ items: localData });
    } else {
      this.setData({ items: [...defaultData] });
    }
  },

  saveData() {
    const storageKey = this.data.type === 'eat' ? 'custom_foods' : 'custom_activities';
    wx.setStorageSync(storageKey, this.data.items);
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  addItem() {
    const val = this.data.inputValue.trim();
    if (!val) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
    
    if (this.data.items.includes(val)) {
      wx.showToast({ title: '该项已存在', icon: 'none' });
      return;
    }

    const newItems = [val, ...this.data.items];
    this.setData({
      items: newItems,
      inputValue: ''
    });
    
    this.saveData();
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const currentItems = this.data.items;
    
    wx.showModal({
      title: '删除确认',
      content: `确定要删除 "${currentItems[index]}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          currentItems.splice(index, 1);
          this.setData({ items: currentItems });
          this.saveData();
        }
      }
    });
  },

  resetToDefault() {
    wx.showModal({
      title: '重置确认',
      content: '确定要恢复默认列表吗？你添加的所有内容将被清除。',
      success: (res) => {
        if (res.confirm) {
          const defaultData = this.data.type === 'eat' ? defaultFoods : defaultActivities;
          this.setData({ items: [...defaultData] });
          this.saveData();
          wx.showToast({ title: '已恢复默认', icon: 'success' });
        }
      }
    });
  }
})

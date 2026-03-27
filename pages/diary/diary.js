const app = getApp();

const LUCKY_COLORS = [
  { name: "樱花粉", hex: "#FFB7C5" },
  { name: "薄荷绿", hex: "#98FF98" },
  { name: "海浪蓝", hex: "#7DF9FF" },
  { name: "向日葵黄", hex: "#FFD700" },
  { name: "香芋紫", hex: "#D8BFD8" },
  { name: "奶茶棕", hex: "#D2B48C" },
  { name: "珊瑚橘", hex: "#FF7F50" },
  { name: "元气红", hex: "#FF4500" },
  { name: "珍珠白", hex: "#FDF5E6" }
];

Page({
  data: {
    todayStr: '',
    luckyColor: null,
    todayDo: '',
    diaryText: '',
    locationName: '',
    photos: []
  },
  
  isDiaryLoaded: false,
  lastLoadedDate: '',

  onLoad() {
    this.refreshDate();
  },

  onShow() {
    this.refreshDate();
    this.loadCrossPageData();
    
    if (!this.isDiaryLoaded || this.lastLoadedDate !== this.dateKey) {
      this.loadSavedDiary();
      this.isDiaryLoaded = true;
      this.lastLoadedDate = this.dateKey;
    }
    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  refreshDate() {
    const d = new Date();
    const todayStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    // Internal key format: YYYY-M-D
    this.dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    this.setData({ todayStr });
  },

  loadCrossPageData() {
    const colorData = wx.getStorageSync('lucky_color');
    if (colorData && colorData.date === this.dateKey) {
      this.setData({ luckyColor: colorData.color });
    } else {
      this.setData({ luckyColor: null });
    }

    const foodData = wx.getStorageSync('today_food');
    this.setData({ todayFood: (foodData && foodData.date === this.dateKey) ? foodData.name : '' });

    const doData = wx.getStorageSync('today_do');
    this.setData({ todayDo: (doData && doData.date === this.dateKey) ? doData.name : '' });
  },

  loadSavedDiary() {
    const diaries = wx.getStorageSync('diaries') || {};
    const todayDiary = diaries[this.dateKey];
    if (todayDiary) {
      this.setData({
        diaryText: typeof todayDiary === 'string' ? todayDiary : (todayDiary.text || ''),
        locationName: todayDiary.location || '',
        photos: todayDiary.photos || []
      });
    } else {
      this.setData({
        diaryText: '',
        locationName: '',
        photos: []
      });
    }
  },

  drawLuckyColor() {
    // Generate tick sounds as if spinning
    let tickCount = 0;
    const timer = setInterval(() => {
      app.playTick();
      tickCount++;
      if (tickCount > 15) {
        clearInterval(timer);
      }
    }, 50);

    setTimeout(() => {
      const randColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
      this.setData({ luckyColor: randColor });
      wx.setStorageSync('lucky_color', { date: this.dateKey, color: randColor });
      
      app.playReveal();
      wx.vibrateHeavy();
    }, 800);
  },

  onInput(e) {
    this.setData({ diaryText: e.detail.value });
  },


  chooseLocationManually() {
    wx.chooseLocation({
      success: (res) => {
        if (res.name || res.address) {
          app.playClick();
          this.setData({ locationName: res.name || res.address });
        }
      }
    });
  },

  chooseImages() {
    app.playClick();
    wx.chooseMedia({
      count: 3 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const fs = wx.getFileSystemManager();
        const newPhotos = [];
        res.tempFiles.forEach(file => {
          const ext = file.tempFilePath.split('.').pop() || 'jpg';
          const newPath = `${wx.env.USER_DATA_PATH}/${Date.now()}_${Math.random().toString().slice(2)}.${ext}`;
          try {
            fs.saveFileSync(file.tempFilePath, newPath);
            newPhotos.push(newPath);
          } catch(e) {
            console.error('Failed to save photo', e);
          }
        });
        this.setData({
          photos: this.data.photos.concat(newPhotos)
        });
      }
    });
  },

  removePhoto(e) {
    app.playClick();
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photos;
    
    try {
      wx.getFileSystemManager().removeSavedFile({
        filePath: photos[index]
      });
    } catch(e) {}
    
    photos.splice(index, 1);
    this.setData({ photos });
  },

  saveDiary() {
    const text = this.data.diaryText.trim();
    const diaries = wx.getStorageSync('diaries') || {};
    
    diaries[this.dateKey] = {
      text: text,
      color: this.data.luckyColor,
      food: this.data.todayFood,
      doActivity: this.data.todayDo,
      location: this.data.locationName,
      photos: this.data.photos,
      timestamp: Date.now()
    };
    
    wx.setStorageSync('diaries', diaries);
    
    app.playClick();
    wx.showToast({
      title: '日记已保存',
      icon: 'success'
    });
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  }
})

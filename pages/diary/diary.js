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
    photos: [],
    selectedMoodIndex: 1, // Default to Happy
    moods: [
      { emoji: '🥳', label: '开薰' },
      { emoji: '😊', label: '开心' },
      { emoji: '😐', label: '一般' },
      { emoji: '☹️', label: '难过' },
      { emoji: '😡', label: '生气' }
    ],
    selectedWeatherIndex: 0,
    weathers: [
      { emoji: '☀️', name: '晴天' },
      { emoji: '☁️', name: '阴天' },
      { emoji: '🌧️', name: '雨天' },
      { emoji: '❄️', name: '雪天' },
      { emoji: '⛈️', name: '雷雨' }
    ],
    isRecording: false,
    tempAudioPath: '',
    audioDuration: 0,
    isAudioPlaying: false
  },

  onLoad() {
    this.refreshDate();
    this.initRecorder();
    this.initAudioPlayer();
  },

  initRecorder() {
    const rm = wx.getRecorderManager();
    this.recorderManager = rm;
    
    rm.onStart(() => {
      console.log('recording start');
      this.setData({ isRecording: true });
    });
    
    rm.onStop((res) => {
      console.log('recording stop', res);
      const { tempFilePath, duration } = res;
      this.setData({ 
        isRecording: false,
        tempAudioPath: tempFilePath,
        audioDuration: Math.round(duration / 1000)
      });
    });
    
    rm.onError((res) => {
      console.error('recording error', res);
      wx.showToast({ title: '录音失败', icon: 'none' });
      this.setData({ isRecording: false });
    });
  },

  initAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onPlay(() => this.setData({ isAudioPlaying: true }));
    this.innerAudioContext.onPause(() => this.setData({ isAudioPlaying: false }));
    this.innerAudioContext.onStop(() => this.setData({ isAudioPlaying: false }));
    this.innerAudioContext.onEnded(() => this.setData({ isAudioPlaying: false }));
  },

  onShow() {
    this.refreshDate();
    this.loadCrossPageData();
    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
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

  selectMood(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedMoodIndex: index });
    app.playClick();
  },

  selectWeather(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedWeatherIndex: index });
    app.playClick();
  },

  getDiaryPrompt() {
    const prompts = [
      "今天让你嘴角上扬的瞬间是什么？",
      "今天尝试了什么新的事物吗？",
      "如果今天能重来，你想改变哪一秒？",
      "今天的哪顿饭最好吃？",
      "今天有遇到让你感到温暖的人吗？",
      "此时此刻的心情像什么季节？",
      "对自己说一句辛苦啦！"
    ];
    const rand = prompts[Math.floor(Math.random() * prompts.length)];
    wx.showModal({
      title: '灵感启发',
      content: rand,
      confirmText: '记下了',
      showCancel: false,
      success: () => {
        app.playTada();
      }
    });
  },

  toggleRecording() {
    if (this.data.isRecording) {
      this.recorderManager.stop();
    } else {
      wx.authorize({
        scope: 'scope.record',
        success: () => {
          this.recorderManager.start({
            duration: 60000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 96000,
            format: 'mp3'
          });
        },
        fail: () => {
          wx.showModal({
            title: '授权提示',
            content: '需要麦克风权限才能录音哦',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting();
            }
          });
        }
      });
    }
  },



  playTempAudio() {
    if (this.data.isAudioPlaying) {
      this.innerAudioContext.pause();
    } else {
      this.innerAudioContext.src = this.data.tempAudioPath;
      this.innerAudioContext.play();
    }
  },

  clearTempAudio() {
    this.setData({
      tempAudioPath: '',
      audioDuration: 0,
      isAudioPlaying: false
    });
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
    if (!text && !this.data.locationName && this.data.photos.length === 0) {
      wx.showToast({ title: '写点什么吧', icon: 'none' });
      return;
    }

    const diaryList = wx.getStorageSync('diary_list') || [];
    
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    const newEntry = {
      id: Date.now() + '_' + Math.floor(Math.random() * 1000),
      date: this.data.todayStr,
      time: timeStr,
      text: text,
      color: this.data.luckyColor,
      mood: this.data.moods[this.data.selectedMoodIndex],
      weather: this.data.weathers[this.data.selectedWeatherIndex],
      food: this.data.todayFood,
      doActivity: this.data.todayDo,
      location: this.data.locationName,
      photos: this.data.photos,
      voicePath: '',
      voiceDuration: 0,
      timestamp: Date.now()
    };

    // Save Voice Memo permanent
    if (this.data.tempAudioPath) {
      const fs = wx.getFileSystemManager();
      const ext = 'mp3';
      const newPath = `${wx.env.USER_DATA_PATH}/${Date.now()}_voice.${ext}`;
      try {
        fs.saveFileSync(this.data.tempAudioPath, newPath);
        newEntry.voicePath = newPath;
        newEntry.voiceDuration = this.data.audioDuration;
      } catch(e) {
        console.error('Failed to save voice', e);
      }
    }
    
    diaryList.unshift(newEntry);
    wx.setStorageSync('diary_list', diaryList);
    
    // Clear editor after posting
    this.setData({
      diaryText: '',
      locationName: '',
      photos: [],
      selectedMoodIndex: 1,
      selectedWeatherIndex: 0,
      tempAudioPath: '',
      audioDuration: 0
    });
    
    app.playClick();
    wx.showToast({
      title: '发布成功',
      icon: 'success'
    });
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  }
})

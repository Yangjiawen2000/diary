Page({
  data: {
    historyList: [],
    allHistoryList: [],
    currYear: 0,
    currMonth: 0,
    calendarDays: [],
    diaryDatesMap: {},
    selectedDateStr: '',
    playingAudioId: null
  },
  
  onLoad() {
    this.initAudioPlayer();
  },

  onShow() {
    this.loadHistory();
  },

  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  },

  initAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onPlay(() => {});
    this.innerAudioContext.onPause(() => this.setData({ playingAudioId: null }));
    this.innerAudioContext.onStop(() => this.setData({ playingAudioId: null }));
    this.innerAudioContext.onEnded(() => this.setData({ playingAudioId: null }));
    this.innerAudioContext.onError((res) => {
      console.error('audio error', res);
      this.setData({ playingAudioId: null });
    });
  },

  playHistoryAudio(e) {
    const { path, id } = e.currentTarget.dataset;
    
    if (this.data.playingAudioId === id) {
      this.innerAudioContext.pause();
    } else {
      getApp().playClick();
      this.innerAudioContext.stop();
      this.innerAudioContext.src = path;
      this.innerAudioContext.play();
      this.setData({ playingAudioId: id });
    }
  },
  
  loadHistory() {
    const rawData = wx.getStorageSync('diaries') || {};
    const diaryList = wx.getStorageSync('diary_list') || [];
    
    let list = [...diaryList];
    
    // Migrate old format to new list format
    if (Object.keys(rawData).length > 0) {
      for (const dateKey in rawData) {
        const item = rawData[dateKey];
        let migratedEntry = null;
        if (typeof item === 'string') {
          migratedEntry = {
            id: dateKey + '_legacy',
            date: dateKey.replace(/-/g, '年').replace(/-/g, '月') + '日', // fixed migration bug
            time: '',
            text: item,
            timestamp: new Date(dateKey.replace(/-/g, '/')).getTime()
          };
        } else if (item) {
          const d = new Date(item.timestamp || Date.now());
          migratedEntry = {
            id: dateKey + '_legacy',
            date: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
            time: '',
            ...item
          };
        }
        if (migratedEntry) list.push(migratedEntry);
      }
      wx.removeStorageSync('diaries');
      list.sort((a, b) => b.timestamp - a.timestamp);
      wx.setStorageSync('diary_list', list);
    }
    
    // Build quick lookup map
    const datesMap = {};
    list.forEach(item => {
      if (item.date) datesMap[item.date] = true;
    });

    this.setData({ 
      allHistoryList: list,
      diaryDatesMap: datesMap
    });

    // Init calendar state if null
    if (this.data.currYear === 0) {
      const now = new Date();
      this.setData({
        currYear: now.getFullYear(),
        currMonth: now.getMonth() + 1
      });
    }

    this.initCalendar(this.data.currYear, this.data.currMonth);
    this.updateFilteredList();
  },

  initCalendar(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0(Sun) - 6(Sat)
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    const days = [];
    
    // Previous month trailing days
    for (let i = 0; i < firstDayOfWeek; i++) {
       const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
       const pMonth = month === 1 ? 12 : month - 1;
       const pYear = month === 1 ? year - 1 : year;
       days.push(this.createDayObj(pYear, pMonth, dayNum, 'prev'));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
       days.push(this.createDayObj(year, month, i, 'current'));
    }
    
    // Next month filling
    const totalCells = (days.length > 35) ? 42 : 35; // Guarantee 5 or 6 full weeks
    let nextDayNum = 1;
    while (days.length < totalCells) {
       const nMonth = month === 12 ? 1 : month + 1;
       const nYear = month === 12 ? year + 1 : year;
       days.push(this.createDayObj(nYear, nMonth, nextDayNum++, 'next'));
    }
    
    this.setData({ calendarDays: days });
  },

  createDayObj(y, m, d, type) {
    const dStr = `${y}年${m}月${d}日`;
    return {
      day: d,
      type: type,
      dateStr: dStr,
      hasDiary: !!this.data.diaryDatesMap[dStr],
      isSelected: dStr === this.data.selectedDateStr
    };
  },

  prevMonth() {
    let y = this.data.currYear;
    let m = this.data.currMonth;
    if (m === 1) { m = 12; y--; } else { m--; }
    this.setData({ currYear: y, currMonth: m });
    this.initCalendar(y, m);
  },

  nextMonth() {
    let y = this.data.currYear;
    let m = this.data.currMonth;
    if (m === 12) { m = 1; y++; } else { m++; }
    this.setData({ currYear: y, currMonth: m });
    this.initCalendar(y, m);
  },

  selectDate(e) {
    const tappedDate = e.currentTarget.dataset.date;
    const type = e.currentTarget.dataset.type;
    
    if (type === 'prev') this.prevMonth();
    if (type === 'next') this.nextMonth();

    if (this.data.selectedDateStr === tappedDate) {
      // Toggle off
      this.setData({ selectedDateStr: '' });
    } else {
      getApp().playClick();
      this.setData({ selectedDateStr: tappedDate });
    }
    
    // Refresh UI dots for newly selected
    this.initCalendar(this.data.currYear, this.data.currMonth);
    this.updateFilteredList();
  },

  updateFilteredList() {
    const filter = this.data.selectedDateStr;
    const full = this.data.allHistoryList;
    if (!filter) {
      this.setData({ historyList: full });
    } else {
      const filtered = full.filter(item => item.date === filter);
      this.setData({ historyList: filtered });
    }
  }
})

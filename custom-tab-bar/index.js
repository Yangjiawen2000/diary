Component({
  data: {
    selected: 0,
    color: "#bcaaa4",
    selectedColor: "#d84315",
    list: [{
      pagePath: "/pages/eat/eat",
      text: "吃什么",
      icon: "🍔"
    }, {
      pagePath: "/pages/do/do",
      text: "做什么",
      icon: "🏃"
    }, {
      pagePath: "/pages/diary/diary",
      text: "日记",
      icon: "📖",
      isSpecial: true
    }, {
      pagePath: "/pages/yesno/yesno",
      text: "Yes/No",
      icon: "🪙"
    }, {
      pagePath: "/pages/profile/profile",
      text: "我的",
      icon: "👤"
    }]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({ selected: data.index });
      getApp().playClick(); // Play a nice click on tab change
    }
  }
})

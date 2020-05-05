const app = getApp();

Component({
  properties: {
    text: {
      type: String,
      value: "Wechat",
    },
    back: {
      type: Boolean,
      value: false,
    },
    home: {
      type: Boolean,
      value: false,
    },
    roomNum: {
      type: Int16Array,
      value: 0,
    },
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight + "px",
    navigationBarHeight: app.globalData.statusBarHeight + 44 + "px",
  },

  methods: {
    backHome: function () {
      let pages = getCurrentPages();
      wx.navigateBack({
        delta: pages.length,
      });
    },
    back: function () {
      wx.navigateBack({
        delta: 1,
      });
    },
  },
});

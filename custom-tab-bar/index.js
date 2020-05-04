const app = getApp();
Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [
      {
        pagePath: "/pages/tradingFloor/tradingFloor",
        text: "交易大厅",
        iconPath: "../assets/tab/ShopIconGray.png",
        selectedIconPath: "../assets/tab/ShopIconActive.png",
      },
      {
        pagePath: "/pages/profile/profile",
        text: "护照信息",
        iconPath: "../assets/tab/PassportIconGray.png",
        selectedIconPath: "../assets/tab/PassportIcon.png",
      },
    ],
    //适配IphoneX的屏幕底部横线
    isIphoneX: app.globalData.isIphoneX,
  },
  attached() {},
  methods: {
    switchTab(e) {
      const dataset = e.currentTarget.dataset;
      const path = dataset.path;
      const index = dataset.index;
      //tabbar切换界面
      wx.switchTab({
        url: path,
      });
      this.setData({
        selected: index,
      });
    },
  },
});

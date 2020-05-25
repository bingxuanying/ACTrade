// pages/tradeHistory/tradeHistory.js
const app = getApp();
const db = wx.cloud.database();
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    loadingGifUrl: "",
    wishlist: {},
    tradeHisory: {},
  },
  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      loadingGifUrl: iu.gif.EarthLoading,
    });

    //TODO: Need to modify
    db.collection("UsersProfile")
      .get()
      .then((res) => {
        let info = res.data[0];
        console.log(info);
        this.setData({
          wishlist: info.wishlist,
          tradeHistory: info.tradeHistory,
        });
        console.log(this.data.tradeHistory);
      })
      .catch((res) => {
        console.log(res);
      });
  },
});

// pages/wishlist/wishlist.js
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
    collectMode: false,
    deleteList: {},
  },
  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      loadingGifUrl: iu.gif.EarthLoading,
    });
    db.collection("UsersProfile")
      .get()
      .then((res) => {
        let info = res.data[0];
        console.log(info);
        this.setData({
          wishlist: info.wishlist,
          tradeHistory: info.tradeHistory,
        });
      })
      .catch((res) => {
        console.log(res);
      });
  },
  onTapCollect: function () {
    console.log("触发onTapCollect");
    this.setData({
      collectMode: !this.data.collectMode,
    });

    if (!this.data.collectMode) {
      // on -> off
      console.log("保存心愿单");
      let _wishlist = this.data.wishlist;
      for (var x in this.data.deleteList) {
        delete _wishlist[x];
      }
      app.globalData.gameProfile.wishlist = _wishlist;
      this.setData({
        wishlist: _wishlist,
      });
      // <--------------------- call cloud func ----------------------->
      let that = this;
      console.log(that.data.wishlist);
      console.log(that.data.tradeHistory);
      wx.cloud
        .callFunction({
          name: "wishlistUpdater",
          data: {
            wishlist: that.data.wishlist,
            tradeHistory: that.data.tradeHistory,
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((res) => {
          console.log(res);
        });
    }
  },

  onTapCollectAdd: function (e) {
    let _info = e.currentTarget.dataset.info;
    console.log(_info.zh_name + "clicked");
    if (!this.data.deleteList.hasOwnProperty(_info.zh_name)) {
      //这个东西不在deleteList里，要删取
      let _deleteList = this.data.deleteList;
      _deleteList[_info.zh_name] = true;
      this.setData({
        deleteList: _deleteList,
      });
      console.log(this.data.deleteList);
    } else {
      let _deleteList = this.data.deleteList;
      delete _deleteList[_info.zh_name];
      this.setData({
        deleteList: _deleteList,
      });
      console.log(this.data.deleteList);
    }
  },
  onTapItem: function (e) {
    let _info = e.currentTarget.dataset.info;
    wx.navigateTo({
      url: "/pages/nookeaGoods/nookeaGoods?_id=" + _info._id,
    });
  },
});

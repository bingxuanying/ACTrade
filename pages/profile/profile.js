// pages/profile/profile.js
const app = getApp();
const db = wx.cloud.database();
import iu from "../../utils/imgUrl";

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    wxid: "",
    nickname: "",
    islandName: "",
    fruit: "apple",
    hemisphere: "north",
    animActive: false,
    isLoading: true,
    isSaving: false,
    loadingGifUrl: "",
    watcher: null,
  },
  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        nickname: app.globalData.gameProfile.nickname,
        islandName: app.globalData.gameProfile.islandName,
        fruit: app.globalData.gameProfile.fruit,
        hemisphere: app.globalData.gameProfile.hemisphere,
        wxid: app.globalData.gameProfile.wxid,
        isLoading: true,
        wishlist: app.globalData.gameProfile.wishlist,
        tradeHistory: app.globalData.gameProfile.tradeHistory,
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        // onLaunch -> onLoad -> onLaunch: has to get data here
        if (res.userInfo) {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            nickname: app.globalData.gameProfile.nickname,
            islandName: app.globalData.gameProfile.islandName,
            fruit: app.globalData.gameProfile.fruit,
            hemisphere: app.globalData.gameProfile.hemisphere,
            wxid: app.globalData.gameProfile.wxid,
            wishlist: app.globalData.gameProfile.wishlist,
            tradeHistory: app.globalData.gameProfile.tradeHistory,
          });
        }
        console.log(this.data.wishlist);
        console.log(this.data.tradeHistory);
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });

          db.collection("UsersProfile")
            .get()
            .then((res) => {
              if (res.data.length > 0) {
                app.globalData.id = res.data[0]._id;
                app.globalData.gameProfile = {
                  nickname: res.data[0].nickname,
                  islandName: res.data[0].islandName,
                  fruit: res.data[0].fruit,
                  hemisphere: res.data[0].hemisphere,
                  wxid: res.data[0].wxid,
                  wishlist: res.data[0].wishlist,
                  tradeHistory: res.data[0].tradeHistory,
                };
                this.setData({
                  nickname: res.data[0].nickname,
                  islandName: res.data[0].islandName,
                  fruit: res.data[0].fruit,
                  hemisphere: res.data[0].hemisphere,
                  wxid: res.data[0].wxid,
                  wishlist: res.data[0].wishlist,
                  tradeHistory: res.data[0].tradeHistory,
                });
              }
            })
            .catch((err) => {
              console("profile onload getuserinfo err: ");
              console(err);
            });
        },
      });
    }
    this.setData({
      passport: iu.imgUrl.profile.passport,
      wishlistIcon: iu.imgUrl.profile.wishlistIcon,
      tradeHistoryIcon: iu.imgUrl.profile.tradeHistoryIcon,
    });
    this.createWatcher();
  },
  getUserInfo: function (e) {
    console.log(e);

    if (e.detail.errMsg === "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      });
      db.collection("UsersProfile").get({
        success: (userData) => {
          if (userData.data.length > 0) {
            console.log("if");
            app.globalData.id = userData.data[0]._id;
            app.globalData.openid = userData.data[0]._openid;
            app.globalData.gameProfile = {
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
              wxid: userData.data[0].wxid,
            };

            this.setData({
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
              wxid: userData.data[0].wxid,
            });

            db.collection("UsersProfile")
              .doc(app.globalData.id)
              .update({
                data: {
                  userInfo: app.globalData.userInfo,
                },
              });
          } else {
            db.collection("UsersProfile").add({
              data: {
                userInfo: app.globalData.userInfo,
                nickname: "",
                islandName: "",
                fruit: "apple",
                hemisphere: "north",
                wxid: "",
                subscription: false,
                curRoomid: null,
                isMaster: false,
                wishlist: {},
                tradeHistory: {
                  news: {},
                  selling: {},
                  buying: {},
                  history: {},
                },
              },
              success: (userData) => {
                console.log(userData);
                app.globalData.id = userData._id;
              },
            });
          }
        },
      });
    }
  },
  bindWxidInput: function (e) {
    this.setData({
      wxid: e.detail.value,
    });
    console.log("wxid: " + this.data.wxid);
  },
  bindNicknameInput: function (e) {
    this.setData({
      nickname: e.detail.value,
    });
    console.log("nickname: " + this.data.nickname);
  },
  bindIslandNameInput: function (e) {
    this.setData({
      islandName: e.detail.value,
    });
    console.log("islandName: " + this.data.islandName);
  },
  onTapApple: function () {
    this.setData({
      fruit: "apple",
    });
  },
  onTapCherry: function () {
    this.setData({
      fruit: "cherry",
    });
  },
  onTapOrange: function () {
    this.setData({
      fruit: "orange",
    });
  },
  onTapPeach: function () {
    this.setData({
      fruit: "peach",
    });
  },
  onTapPear: function () {
    this.setData({
      fruit: "pear",
    });
  },
  changeSwitch: function (i) {
    this.setData({ animActive: true });
    if (this.data.hemisphere == "north") {
      this.setData({ hemisphere: "south" });
    } else {
      this.setData({ hemisphere: "north" });
    }
    // console.log(this.data.hemisphere);
  },
  onTapDone: function () {
    this.setData({
      isSaving: true,
    });
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          userInfo: this.data.userInfo,
          nickname: this.data.nickname,
          islandName: this.data.islandName,
          fruit: this.data.fruit,
          hemisphere: this.data.hemisphere,
          wxid: this.data.wxid,
        },
        success: (res) => {
          app.globalData.gameProfile = {
            nickname: this.data.nickname,
            islandName: this.data.islandName,
            fruit: this.data.fruit,
            hemisphere: this.data.hemisphere,
            wxid: this.data.wxid,
          };
          this.setData({ isSaving: false });
        },
      });
  },
  wishlistClick: function () {
    wx.navigateTo({
      url: "/pages/wishlist/wishlist",
    });
  },
  tradeHistoryClick: function () {
    let that = this;
    wx.navigateTo({
      url: "/pages/tradeHistory/tradeHistory",
    });
  },
  // TabBar setting
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2, // 根据tab的索引值设置
      });
    }
  },
  onReady() {
    var that = this;
    setTimeout(function () {
      that.setData({
        isLoading: false,
      });
    }, 500);
  },
  onUnload() {
    this.data.watcher.close();
  },
  createWatcher() {
    // Watcher: only watch tradeHistory.isUpdated
    let that = this;
    this.data.watcher = db
      .collection("UsersProfile")
      .where({})
      .watch({
        onChange: function (snapshot) {
          let changeField = snapshot.docChanges[0].updatedFields;
          if (
            typeof changeField !== "undefined" &&
            typeof changeField["tradeHistory.isUpdated"] !== "undefined"
          ) {
            that.setData({
              "tradeHistory.isUpdated": changeField["tradeHistory.isUpdated"],
            });
          }
        },
        onError: function (err) {
          console.log(err);
        },
      });
  },
});

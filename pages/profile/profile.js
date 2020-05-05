// pages/profile/profile.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    nickname: "",
    islandName: "",
    fruit: "apple",
    hemisphere: "north",
    animActive: false,
    isLoading: true,
    isSaving: false,
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        nickname: app.globalData.gameProfile.nickname,
        islandName: app.globalData.gameProfile.islandName,
        fruit: app.globalData.gameProfile.fruit,
        hemisphere: app.globalData.gameProfile.hemisphere,
        isLoading: true,
        isSaving: false,
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
          });

          db.collection("UsersProfile").get({
            success: (res) => {
              if (res.data.length > 0) {
                this.setData({
                  nickname: res.data[0].nickname,
                  islandName: res.data[0].islandName,
                  fruit: res.data[0].fruit,
                  hemisphere: res.data[0].hemisphere,
                });
              }
            },
            fail: (res) => {
              console.log("fail: " + res);
            },
          });
        }
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

          db.collection("UsersProfile").get({
            success: (res) => {
              if (res.data.length > 0) {
                this.globalData.id = res.data[0]._id;
                this.globalData.gameProfile = {
                  nickname: res.data[0].nickname,
                  islandName: res.data[0].islandName,
                  fruit: res.data[0].fruit,
                  hemisphere: res.data[0].hemisphere,
                };
                this.setData({
                  nickname: res.data[0].nickname,
                  islandName: res.data[0].islandName,
                  fruit: res.data[0].fruit,
                  hemisphere: res.data[0].hemisphere,
                });
              }
            },
            fail: (res) => {
              console.log("fail: " + res);
            },
          });
        },
      });
    }
    console.log("set isLoading true");
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
            app.globalData.id = userData.data[0]._id;
            app.globalData.gameProfile = {
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
            };

            this.setData({
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
            });

            db.collection("UsersProfile").update({
              data: {
                userInfo: this.data.userInfo,
              },
              success: (res) => {
                app.globalData.id = userData.data[0]._id;
              },
            });
          } else {
            db.collection("UsersProfile").add({
              data: {
                userInfo: this.data.userInfo,
                nickname: "",
                islandName: "",
                fruit: "apple",
                hemisphere: "north",
              },
              success: (res) => {
                app.globalData.id = userData.data[0]._id;
              },
            });
          }
        },
      });
    }
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
    //触发保存动画
    var that = this;
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
        },
        success: (res) => {
          app.globalData.gameProfile = {
            nickname: this.data.nickname,
            islandName: this.data.islandName,
            fruit: this.data.fruit,
            hemisphere: this.data.hemisphere,
          };
          this.setData({ isSaving: false });
        },
      });
  },
  // TabBar setting
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1, // 根据tab的索引值设置
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
});

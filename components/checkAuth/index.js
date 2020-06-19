const app = getApp();
const db = wx.cloud.database();
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;
const util = require("../../utils/util");
const _ = db.command;

Component({
  properties: {},
  data: {
    isAuth: false,
    hasNickname: false,
    hasIslandname: false,
    clientStatus: "no auth", // no auth -> no name -> ok
    loading: {
      isTransfer: false,
      isEnter: false,
    },
  },

  methods: {
    // --- Auth Modal ---
    onTapRegister: function (e) {
      console.log(e);

      if (e.detail.errMsg === "getUserInfo:ok") {
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
          loading: {
            ...this.data.loading,
            isTransfer: true,
          },
        });

        db.collection("UsersProfile").get({
          success: (userData) => {
            if (userData.data.length > 0) {
              console.log("has previous user");
              console.log(userData);
              app.globalData.id = userData.data[0]._id;
              app.globalData.openid = userData.data[0]._openid;
              app.globalData.gameProfile = {
                ...app.globalData.gameProfile,
                nickname: userData.data[0].nickname,
                islandName: userData.data[0].islandName,
                fruit: userData.data[0].fruit,
                hemisphere: userData.data[0].hemisphere,
                wishlist: userData.data[0].wishlist,
                tradeHistory: userData.data[0].tradeHistory,
                wxid: userData.data[0].wxid,
              };

              this.setData({
                collect: {
                  ...this.data.collect,
                  wishlist: userData.data[0].wishlist
                    ? userData.data[0].wishlist
                    : {},
                  tradeHistory: userData.data[0].tradeHistory
                    ? userData.data[0].tradeHistory
                    : {},
                },
                input: {
                  nickname: userData.data[0].nickname,
                  islandName: userData.data[0].islandName,
                },
              });

              db.collection("UsersProfile")
                .doc(app.globalData.id)
                .update({
                  data: {
                    userInfo: app.globalData.userInfo,
                  },
                });
              this.setData({
                clientStatus: "no name",
                loading: {
                  ...this.data.loading,
                  isTransfer: false,
                },
              });
              app.globalData.clientStatus = "no name";
            } else {
              console.log("no previous user");
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
                    news: {
                      isUpdated: false,
                      rooms: {},
                    },
                    selling: {
                      isUpdated: false,
                      rooms: {},
                    },
                    buying: {
                      isUpdated: false,
                      rooms: {},
                    },
                    history: {
                      isUpdated: false,
                      rooms: {},
                    },
                  },
                },
                success: (userData) => {
                  console.log(userData);
                  app.globalData.id = userData._id;
                  this.setData({
                    clientStatus: "no name",
                    loading: {
                      ...this.data.loading,
                      isTransfer: false,
                    },
                  });
                },
              });
            }
          },
        });
      }
    },

    onTapEnter: function () {
      this.setData({
        loading: {
          ...this.data.loading,
          isEnter: true,
        },
      });
      db.collection("UsersProfile")
        .doc(app.globalData.id)
        .update({
          data: {
            nickname: this.data.input.nickname,
            islandName: this.data.input.islandName,
          },
        })
        .then(() => {
          app.globalData.gameProfile.nickname = this.data.input.nickname;
          app.globalData.gameProfile.islandName = this.data.input.islandName;
          app.globalData.clientStatus = "ok";
          this.setData({
            clientStatus: "ok",
            loading: {
              ...this.data.loading,
              isEnter: false,
            },
          });
          // 触发父级的刷新function
          this.triggerEvent("authdone");
        });
    },

    onTapBack: function () {
      // this.setData({ clientStatus: "ok" });
      wx.switchTab({
        url: "/pages/profile/profile",
      });
    },

    bindNicknameInput: function (e) {
      this.setData({
        input: {
          ...this.data.input,
          nickname: e.detail.value,
        },
      });
      console.log("nickname: " + this.data.input.nickname);
    },

    bindIslandNameInput: function (e) {
      this.setData({
        input: {
          ...this.data.input,
          islandName: e.detail.value,
        },
      });
      console.log("islandName: " + this.data.input.islandName);
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      console.log("checkAuth attached");
      this.setData({
        clientStatus: app.globalData.clientStatus,
      });
      // 检查auth, no name情况
      if (this.data.clientStatus !== "ok") {
        var that = this;
        // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.userInfo"
        wx.getSetting({
          success(res) {
            console.log(res.authSetting["scope.userInfo"]);
            that.setData({
              clientStatus: "ok",
            });
            app.globalData.clientStatus = "ok";
            if (!res.authSetting["scope.userInfo"]) {
              wx.authorize({
                scope: "scope.userInfo",
                success() {
                  // 用户已经同意小程序获取用户信息
                  wx.getUserInfo();
                  that.getUserInfo();
                  res.authSetting = {
                    "scope.userInfo": true,
                    "scope.userLocation": true,
                  };
                },
                fail() {
                  that.setData({
                    clientStatus: "no auth",
                  });
                  app.globalData.clientStatus = "no auth";
                },
              });
            }
          },
        });
      }
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
});

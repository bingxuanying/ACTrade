//app.js
App({
  onLaunch: function () {
    // Init cloud env
    wx.cloud.init({
      env: "vegi-exchange-45j4z",
    });

    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail: (res) => {
        console.log("login fail");
        this.globalData.clientStatus = "no auth";
      },
    });
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        console.log("on launch");
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo;
              this.globalData.clientStatus = "ok";
              const db = wx.cloud.database();
              db.collection("UsersProfile")
                .get()
                .then((res) => {
                  console.log(res);
                  if (res.data.length > 0) {
                    this.globalData.id = res.data[0]._id;
                    this.globalData.openid = res.data[0]._openid;
                    this.globalData.gameProfile = {
                      nickname: res.data[0].nickname,
                      islandName: res.data[0].islandName,
                      fruit: res.data[0].fruit,
                      hemisphere: res.data[0].hemisphere,
                      wxid: res.data[0].wxid ? res.data[0].wxid : "",
                      wishlist: res.data[0].wishlist,
                      tradeHistory: res.data[0].tradeHistory,
                    };
                  }
                })
                .then(() => {
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res);
                  }
                })
                .catch((err) => {
                  console.log("onlaunch getuserinfo err: ");
                  console.log(err);
                });
            },
          });
        }
      },
    });
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight;
        console.log("statusBarHeight: " + this.globalData.statusBarHeight);
      },
      fail: (res) => {
        console.log("get statusBarHeight Failed");
      },
    });
  },
  globalData: {
    id: null,
    openid: null,
    userInfo: null,
    gameProfile: {
      nickname: "",
      islandName: "",
      fruit: "apple",
      hemisphere: "north",
      wishlist: null,
      tradeHistory: null,
      wxid: "",
    },
    roomInfo: {
      roomID: null,
      timeStamp: null,
    },
    clientStatus: "no auth", // no auth -> no name -> ok
    statusBarHeight: 0,
    imgUrl: {
      gif: {
        EarthLoading: "",
        FlightLoading: "",
        IslandLoading: "",
      },
      icons: {
        nook: "",
        SettingIcon: "",
      },
      img: {
        InfoPageBrown_in: "",
        InfoPageRed_in: "",
        InfoPageYellow_in: "",
        InfoPage_out: "",
        passport: "",
      },
    },
  },
});

//app.js
App({
  onLaunch: function () {
    // Init cloud env
    wx.cloud.init({
      env: "vegi-exchange-45j4z",
    });

    // 展示本地存储能力
    var logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    });
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              const db = wx.cloud.database();
              db.collection("UsersProfile").get({
                success: (res) => {
                  if (res.data.length > 0) {
                    this.globalData.id = res.data[0]._id;
                    this.globalData.openid = res.data[0]._openid;
                    this.globalData.gameProfile = {
                      nickname: res.data[0].nickname,
                      islandName: res.data[0].islandName,
                      fruit: res.data[0].fruit,
                      hemisphere: res.data[0].hemisphere,
                    };
                  }
                },
                fail: (res) => {
                  console.log("fail: " + res);
                },
              });

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
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
    // // 获取在线gif
    // wx.cloud.getTempFileURL({
    //   fileList: [
    //     "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/EarthLoading.gif",
    //   ],
    //   success: (res) => {
    //     this.globalData.EarthLoadingUrl = res.fileList[0].tempFileURL;
    //     console.log("AppJS成功获取ImgUrl" + this.globalData.EarthLoadingUrl);
    //   },
    //   fail: (err) => {
    //     console.log("获取在线gif失败");
    //   },
    // });
  },
  // URL call back
  UrlCallBack: function (callback, imgType, imgName) {
    console.log("getting imgUrl of " + imgType + ":" + imgName);
    var that = this;
    if (that.globalData.imgUrl[imgType][imgName]) {
      typeof callback == "function" && callback(that.globalData.imgUrl);
      console.log("执行callback时已经有url了!");
    } else {
      console.log("获取url。。。。。。");
      wx.cloud.getTempFileURL({
        fileList: [
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/EarthLoading.gif",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/InfoPageBrown_in.png",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/InfoPageRed_in.png",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/InfoPageYellow_in.png",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/passport.png",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/IslandLoading.gif",
        ],
        success: (res) => {
          that.globalData.imgUrl.gif.EarthLoading = res.fileList[0].tempFileURL;
          // console.log(res.fileList[0]);
          that.globalData.imgUrl.img.InfoPageBrown_in =
            res.fileList[1].tempFileURL;
          // console.log(res.fileList[1]);
          that.globalData.imgUrl.img.InfoPageRed_in =
            res.fileList[2].tempFileURL;
          // console.log(res.fileList[2]);
          that.globalData.imgUrl.img.InfoPageYellow_in =
            res.fileList[3].tempFileURL;
          // console.log(res.fileList[3]);
          that.globalData.imgUrl.img.passport = res.fileList[4].tempFileURL;
          that.globalData.imgUrl.gif.IslandLoading =
            res.fileList[5].tempFileURL;
          typeof callback == "function" && callback(that.globalData.imgUrl);
        },
        fail: (err) => {
          console.log("获取在线gif失败");
        },
      });
    }
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
    },
    roomInfo: {
      roomID: null,
      timeStamp: null,
    },
    statusBarHeight: 0,
    imgUrl: {
      gif: {
        EarthLoading: "",
        FlightLoading: "",
        IslandLoading: "",
      },
      icons: {
        nook: "",
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

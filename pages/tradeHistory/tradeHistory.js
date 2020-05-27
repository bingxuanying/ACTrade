// pages/tradeHistory/tradeHistory.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;
const util = require("../../utils/util");

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    loadingGifUrl: "",
    wishlist: {},
    tradeHisory: {},
    tagChoose: [true, false, false, false],
    // mapArr用于整合tradeHistory 和 db里的信息
    mapArr: {
      news: {},
      buying: {},
      selling: {},
      history: {},
    },
  },
  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      loadingGifUrl: iu.gif.EarthLoading,
      nowTimestamp: util.formatTime(),
    });

    const getHistory = new Promise((resolve, reject) => {
      if (app.globalData.userInfo) {
        this.setData({
          tradeHistory: app.globalData.gameProfile.tradeHistory,
        });
        resolve();
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = (res) => {
          // onLaunch -> onLoad -> onLaunch: has to get data here
          if (res.userInfo) {
            this.setData({
              tradeHistory: app.globalData.gameProfile.tradeHistory,
            });
          }
          resolve();
        };
      } else {
        wx.getUserInfo({
          success: (res) => {
            app.globalData.userInfo = res.userInfo;
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true,
            });
            resolve();
          },
        });
        resolve(
          db
            .collection("UsersProfile")
            .get()
            .then((res) => {
              let info = res.data[0];
              this.setData({
                wishlist: info.wishlist,
                tradeHistory: info.tradeHistory,
              });
              app.globalData.gameProfile.tradeHistory = info.tradeHistory;
            })
        );
      }
    });

    getHistory.then(() => {
      this.updateMaparr();
    });

    // Watch history并且更新
    db.collection("UsersProfile").watch({
      onChange: (snapshot) => {
        let tradeHistory = snapshot.docChanges[0].doc.tradeHistory;
        app.globalData.gameProfile.tradeHistory = tradeHistory;
        this.setData({
          tradeHistory: tradeHistory,
        });
        this.updateMaparr();
      },
      onError: (err) => {
        console.error(err);
      },
    });

    //每隔10s刷新一次时间
    setInterval(() => {
      console.log("获取时间中...");
      this.setData({
        nowTimestamp: util.formatTime(),
      });
    }, 60000);
  },
  onTagTap: function (e) {
    let index = parseInt(e.currentTarget.dataset.index);
    let _tagChoose = this.data.tagChoose;
    for (var i = 0; i < _tagChoose.length; i++) {
      if (i === index) {
        _tagChoose[i] = true;
      } else {
        _tagChoose[i] = false;
      }
    }
    this.setData({
      tagChoose: _tagChoose,
    });
  },

  updateMaparr: function () {
    let _mapArr = this.data.mapArr;
    for (let x in this.data.tradeHistory) {
      _mapArr[x] = this.data.tradeHistory[x].rooms;
    }
    this.setData({
      mapArr: _mapArr,
    });
  },
  newsClick: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/nookeaGoods/nookeaGoods?_id=" + id,
    });
    let path = "tradeHistory.news.rooms." + id + ".isUpdated";
    // change history.news.rooms[idx].isUpdated -> true
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          [path]: false,
        },
      })
      .then(() => {
        db.collection("UsersProfile")
          .doc(app.globalData.id)
          .get()
          .then((res) => {
            let rooms = res.data.tradeHistory.news.rooms;
            let isUpdated = false;
            for (var x in rooms) {
              if (rooms[x].isUpdated !== false) {
                isUpdated = true;
              }
            }
            //这里更新tradeHistory.isUpdated的东西
            let isTradeHistoryUpdated = false;
            let cat = res.data.tradeHistory;
            for (var x in cat) {
              if (cat[x].isUpdated === true) {
                isTradeHistoryUpdated = true;
              }
            }
            db.collection("UsersProfile")
              .doc(app.globalData.id)
              .update({
                data: {
                  "tradeHistory.isUpdated": isTradeHistoryUpdated,
                  "tradeHistory.news.isUpdated": isUpdated,
                },
              });
          });
      })
      .catch((res) => {
        console.log(res);
      });
  },
  buyNsellClick: function (e) {
    let { roomid, productid, type } = e.currentTarget.dataset;
    wx.navigateTo({
      url:
        "/pages/nookeaRooms/nookeaRooms?id=" +
        roomid +
        "&isMaster=" +
        (type !== "buying" ? "true" : "false"),
    });
    let path = "tradeHistory." + type + ".rooms." + productid + ".isUpdated";
    // change history.news.rooms[idx].isUpdated -> true
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          [path]: false,
        },
      })
      .then(() => {
        db.collection("UsersProfile")
          .doc(app.globalData.id)
          .get()
          .then((res) => {
            let rooms = res.data.tradeHistory[type].rooms;
            let isUpdated = false;
            for (var x in rooms) {
              if (rooms[x].isUpdated !== false) {
                isUpdated = true;
              }
            }
            //这里更新tradeHistory.isUpdated的东西
            let isTradeHistoryUpdated = false;
            let cat = res.data.tradeHistory;
            for (var x in cat) {
              if (cat[x].isUpdated === true) {
                isTradeHistoryUpdated = true;
              }
            }
            let path = "tradeHistory." + type + ".isUpdated";
            db.collection("UsersProfile")
              .doc(app.globalData.id)
              .update({
                data: {
                  "tradeHistory.isUpdated": isTradeHistoryUpdated,
                  [path]: isUpdated,
                },
              });
          });
      })
      .catch((res) => {
        console.log(res);
      });
  },
});

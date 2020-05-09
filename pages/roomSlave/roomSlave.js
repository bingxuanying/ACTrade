// pages/roomSlave/roomSlave.js
const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");

Page({
  data: {
    MasterInfo: {
      avatar: null,
      islandName: "",
      masterName: "",
      fruit: null,
      hemisphere: null,
    },
    // settings data
    roomInfo: {
      code: null,
      roomNum: "",
      flight: "Business",
      price: 500,
      timeLeft: 300,
      people: 3,
      note: "",
    },
    Slaves: [],
    isLoading: false,
    timeStamp: "",
    closeBtnClick: false,
    // page 0 -> line page, page 1 -> setting page
    page: 0,
    firstTimeLoad: true,
    // nav-bar
    statusBarHeight: app.globalData.statusBarHeight,
    // onLoad check status
    clientStatus: "ok", // no auth -> no name -> ok
    subscription: false,
    nickname: "",
    islandName: "",
    fruit: "apple",
    hemisphere: "north",
    isTransfering: false,
    isSaving: false,
    // check current status
    kicked: false,
    closed: false,
    inLine: false,
  },
  onLoad: function (query) {
    if (query.room_id) {
      console.log(query.room_id);
      app.globalData.roomInfo.roomID = query.room_id;
      // registered
      console.log(app.globalData.userInfo);
      if (app.globalData.userInfo) {
        if (
          app.globalData.gameProfile.nickname.length > 0 &&
          app.globalData.gameProfile.islandName.length > 0
        ) {
          app.globalData.roomInfo.timeStamp = util.formatTime();
          this.setData({
            timeStamp: app.globalData.roomInfo.timeStamp,
            clientStatus: "ok",
          });
          this.checkin();
        } else {
          this.setData({ clientStatus: "no name" });
        }
      }
      // has auth
      else if (this.data.canIUse) {
        app.userInfoReadyCallback = (res) => {
          if (res.userInfo) {
            db.collection("UsersProfile").get({
              success: (res) => {
                if (res.data.length > 0) {
                  app.globalData.gameProfile = {
                    nickname: res.data[0].nickname,
                    islandName: res.data[0].islandName,
                    fruit: res.data[0].fruit,
                    hemisphere: res.data[0].hemisphere,
                  };
                  if (
                    app.globalData.gameProfile.nickname.length > 0 &&
                    app.globalData.gameProfile.islandName.length > 0
                  ) {
                    app.globalData.roomInfo.timeStamp = util.formatTime();
                    this.setData({
                      timeStamp: app.globalData.roomInfo.timeStamp,
                    });
                    this.checkin();
                  } else {
                    this.setData({ clientStatus: "no name" });
                  }
                }
              },
              fail: (res) => {
                console.log("fail: " + res);
                wx.switchTab({
                  url: "/pages/tradingFloor/tradingFloor",
                });
              },
            });
          } else {
            this.setData({ clientStatus: "no auth" });
          }
        };
      }
      // no auth or not registered
      else {
        this.setData({ clientStatus: "no auth" });
      }
    } else {
      this.checkin();
    }
    // cloud files
    var that = this;
    app.UrlCallBack(
      function (res) {
        that.setData({
          EarthLoadingUrl: res.gif.EarthLoading,
        });
      },
      "gif",
      "EarthLoadingUrl"
    );
  },
  checkin: function () {
    this.setData({ isLoading: true });

    if (!app.globalData.openid) {
      db.collection("UsersProfile").get({
        success: (res) => {
          if (res.data.length > 0) app.globalData.openid = res.data[0]._openid;
        },
      });
    }

    db.collection("UsersProfile").watch({
      onChange: (snapshot) => {
        //监控数据发生变化时触发
        this.setData({
          subscription: snapshot.docs[0].subscription,
        });
      },
      onError: (err) => {
        console.error(err);
      },
    });

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          slaves: db.command.push({
            openid: app.globalData.openid,
            notified: false,
            avatar: app.globalData.userInfo.avatarUrl,
            islandName: app.globalData.gameProfile.islandName,
            nickname: app.globalData.gameProfile.nickname,
            timeStamp: app.globalData.roomInfo.timeStamp,
          }),
        },
      });

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .get({
        success: (res) => {
          var master = res.data.master;
          console.log(res);
          this.setData({
            MasterInfo: {
              avatar: master.userInfo.avatarUrl,
              islandName: master.gameProfile.islandName,
              masterName: master.gameProfile.nickname,
              fruit: master.gameProfile.fruit,
              hemisphere: master.gameProfile.fruit,
            },
            roomInfo: {
              roomNum: res.data.roomNum,
              code: res.data.code,
              people: res.data.people,
              flight: res.data.flight,
              price: res.data.price,
              timeLeft: res.data.timeLeft,
              note: res.data.note,
            },
            timeStamp: app.globalData.roomInfo.timeStamp,
          });

          this.setData({ isLoading: false });
        },
      });

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .watch({
        onChange: (snapshot) => {
          //监控数据发生变化时触发
          this.setData({
            Slaves: snapshot.docs[0].slaves,
            roomInfo: {
              roomNum: snapshot.docs[0].roomNum,
              code: snapshot.docs[0].code,
              people: snapshot.docs[0].people,
              flight: snapshot.docs[0].flight,
              price: snapshot.docs[0].price,
              timeLeft: snapshot.docs[0].timeLeft,
              note: snapshot.docs[0].note,
            },
          });
          //判断在列队拿到code
          var svs = this.data.Slaves;
          var i = null;
          for (const idx in svs) {
            if (svs[idx].timeStamp === app.globalData.roomInfo.timeStamp) {
              i = idx;
            }
          }
          if (i < this.data.roomInfo.people) {
            this.setData({
              inLine: true,
            });
          } else {
            this.setData({
              inLine: false,
            });
          }

          if (
            snapshot.docs[0].kickedLst &&
            snapshot.docs[0].kickedLst.length > 0
          ) {
            snapshot.docs[0].kickedLst.forEach((kickedStamp) => {
              if (app.globalData.roomInfo.timeStamp === kickedStamp)
                this.setData({ kicked: true });
            });
          }

          if (snapshot.docs[0].status === "closed")
            this.setData({ closed: true });
        },
        onError: (err) => {
          console.error(err);
        },
      });
  },
  LClick: function () {
    if (this.data.page == 1) {
      this.setData({ page: 0, firstTimeLoad: false });
    }
  },
  RClick: function () {
    if (this.data.page == 0) {
      this.setData({ page: 1, firstTimeLoad: false });
    }
  },
  closeBtnClick: function () {
    if (this.data.closeBtnClick == false) {
      this.setData({
        closeBtnClick: true,
        showModal: true,
      });
    } else {
      this.setData({
        closeBtnClick: false,
        showModal: false,
      });
    }
  },
  modalLeaveHide: function (e) {
    this.setData({
      closeBtnClick: false,
      showModal: false,
    });
  },
  onTapClose: function () {
    let isCall = !this.data.closed;
    let that = this;

    if (this.data.kicked) {
      db.collection("Flights")
        .doc(app.globalData.roomInfo.roomID)
        .update({
          data: {
            kickedLst: db.command.pull(app.globalData.roomInfo.timeStamp),
          },
        })
        .then((res) => {
          if (this.data.inLine) {
            wx.cloud
              .callFunction({
                name: "lineUpdater",
                data: {
                  roomNum: that.data.roomInfo.roomNum,
                },
              })
              .then(() => {
                console.log("kick success");
              })
              .catch((err) => {
                console.log("Err: KickRoom - cloud Function");
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      db.collection("Flights")
        .doc(app.globalData.roomInfo.roomID)
        .update({
          data: {
            slaves: db.command.pull({
              avatar: app.globalData.userInfo.avatarUrl,
              islandName: app.globalData.gameProfile.islandName,
              nickname: app.globalData.gameProfile.nickname,
              timeStamp: app.globalData.roomInfo.timeStamp,
            }),
          },
        })
        .then((res) => {
          if (this.data.inLine) {
            wx.cloud
              .callFunction({
                name: "lineUpdater",
                data: {
                  roomNum: that.data.roomInfo.roomNum,
                },
              })
              .then(() => {
                console.log("quit success");
              })
              .catch((err) => {
                console.log("Err: QuitRoom - cloud Function");
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    app.globalData.roomInfo = {
      roomID: null,
      timeStamp: null,
    };

    // wx.navigateBack()
    wx.switchTab({
      url: "/pages/tradingFloor/tradingFloor",
    });
  },
  onShareAppMessage: function (res) {
    console.log(res);
    return {
      title: "来卖大头菜啦！！房间号是" + this.data.roomInfo.roomNum,
      path:
        "/pages/roomSlave/roomSlave?room_id=" + app.globalData.roomInfo.roomID,
      imageUrl: "../../assets/SharePage.png",
    };
  },
  onTapBack: function () {
    app.globalData.roomInfo = {
      roomID: null,
      timeStamp: null,
    };

    // wx.navigateBack()
    wx.switchTab({
      url: "/pages/tradingFloor/tradingFloor",
    });
  },
  onTapRegister: function (e) {
    console.log(e);

    if (e.detail.errMsg === "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({ isTransfering: true });

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

            db.collection("UsersProfile")
              .doc(app.globalData.id)
              .update({
                data: {
                  userInfo: app.globalData.userInfo,
                },
              });
            this.setData({
              clientStatus: "no name",
              isTransfering: true,
            });
          } else {
            db.collection("UsersProfile").add({
              data: {
                userInfo: app.globalData.userInfo,
                nickname: "",
                islandName: "",
                fruit: "apple",
                hemisphere: "north",
                subscription: false,
              },
              success: (userData) => {
                app.globalData.id = userData.data[0]._id;
                this.setData({
                  clientStatus: "no name",
                  isTransfering: true,
                });
              },
            });
          }
        },
      });
    }
  },
  onTapEnter: function () {
    this.setData({ isSaving: true });
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          nickname: this.data.nickname,
          islandName: this.data.islandName,
        },
        success: (res) => {
          app.globalData.gameProfile.nickname = this.data.nickname;
          app.globalData.gameProfile.islandName = this.data.islandName;
          app.globalData.roomInfo.timeStamp = util.formatTime();
          this.setData({ timeStamp: app.globalData.roomInfo.timeStamp });
          this.checkin();
          this.setData({
            clientStatus: "ok",
            isSaving: false,
          });
        },
      });
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
  onSubscribe() {
    var that = this;
    // 订阅消息授权申请;
    wx.requestSubscribeMessage({
      // 传入订阅消息的模板id
      tmplIds: ["qIrI96K_NpjeopDWiH1iYexvCzU6v289wpIqyMEVwYA"],
      success(res) {
        console.log(res);
        wx.showToast({
          title: "订阅成功",
          icon: "success",
          duration: 1000,
        });
        // 修改db的subscription
        db.collection("UsersProfile")
          .where({
            _openid: app.globalData.openid,
          })
          .update({
            data: {
              subscription: true,
            },
            success: (res) => {
              console.log("成功订阅");
            },
            fail: (res) => {
              console.log("订阅失败");
            },
          });
      },
      fail(res) {
        wx.showToast({
          title: "订阅失败",
          icon: "none",
          duration: 1000,
        });
        console.log(res);
      },
    });
  },
});

// pages/roomSlave/roomSlave.js
const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");
import iu from "../../utils/imgUrl";

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
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    watcher1: null,
    watcher2: null,
  },
  onLoad: function (query) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight });
    console.log(query.room_id);
    app.globalData.roomInfo.roomID = query.room_id;
    // registered
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {
      console.log("check point 1");
      if (
        app.globalData.gameProfile.nickname.length > 0 &&
        app.globalData.gameProfile.islandName.length > 0
      ) {
        this.setData({ clientStatus: "ok" });
        this.checkin();
      } else {
        this.setData({ clientStatus: "no name" });
      }
    }
    // has auth
    else if (this.data.canIUse) {
      console.log("check point 2");
      this.setData({ clientStatus: "no auth" });

      app.userInfoReadyCallback = (res) => {
        if (res.userInfo) {
          console.log("check point 2.1");
          if (
            app.globalData.gameProfile.nickname.length > 0 &&
            app.globalData.gameProfile.islandName.length > 0
          ) {
            this.setData({ clientStatus: "ok" });
            this.checkin();
          } else {
            this.setData({ clientStatus: "no name" });
          }
        } else {
          console.log("check point 2.2");
          this.setData({ clientStatus: "no auth" });
        }
      };
    }
    // no auth or not registered
    else {
      console.log("check point 3");
      this.setData({ clientStatus: "no auth" });
    }

    this.setData({
      EarthLoadingUrl: iu.imgUrl.gif.EarthLoading,
    });
  },
  checkin: function () {
    this.setData({ isLoading: true });

    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .get()
      .then((res) => {
        console.log(res.data.curRoomid);
        if (res.data.curRoomid) {
          console.log("redirect needed: either original or master");
          app.globalData.roomInfo.roomID = res.data.curRoomid;
          if (res.data.isMaster) throw "to master";
        } else {
          console.log("update room_id");
          db.collection("UsersProfile")
            .doc(app.globalData.id)
            .update({
              data: {
                curRoomid: app.globalData.roomInfo.roomID,
              },
            });
        }
      })
      .then(() => {
        db.collection("Flights")
          .doc(app.globalData.roomInfo.roomID)
          .get()
          .then((res) => {
            console.log("step 1");
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
            });
          })
          .then(() => {
            console.log("step 2");
            console.log("openid: " + app.globalData.openid);
            if (!app.globalData.openid) {
              console.log("no openid");
              db.collection("UsersProfile")
                .get()
                .then((res) => {
                  if (res.data.length > 0)
                    app.globalData.openid = res.data[0]._openid;
                });
              console.log("now openid");
            }
          })
          .then(() => {
            console.log("step 3");
            // Check if the user has already been in line
            db.collection("Flights")
              .doc(app.globalData.roomInfo.roomID)
              .get()
              .then((res) => {
                console.log(res);
                var _slaves = res.data.slaves;
                _slaves.forEach((item) => {
                  if (item.openid === app.globalData.openid)
                    app.globalData.roomInfo.timeStamp = item.timeStamp;
                });
                console.log(
                  "fetched time data from db" +
                    app.globalData.roomInfo.timeStamp
                );
              })
              .then(() => {
                console.log("step 4");
                if (!app.globalData.roomInfo.timeStamp) {
                  console.log("init time data");
                  app.globalData.roomInfo.timeStamp = util.formatTime();
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
                  console.log("done update time data");
                }
              })
              .then(() => {
                console.log("step 5");
                console.log(app.globalData.roomInfo.timeStamp);
                this.setData({
                  timeStamp: app.globalData.roomInfo.timeStamp,
                  isLoading: false,
                });
              });
          });

        this.data.watcher1 = db.collection("UsersProfile").watch({
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

        this.data.watcher2 = db
          .collection("Flights")
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
                this.setData({ inLine: true });
              } else {
                this.setData({ inLine: false });
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
      })
      .catch((err) => {
        console.log(err);
        if (err === "to master") {
          wx.redirectTo({
            url: "/pages/roomMaster/roomMaster",
          });
        }
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
    let that = this;
    let cloudCall = () => {
      console.log("call cloud");
      if (this.data.inLine) {
        wx.cloud
          .callFunction({
            name: "lineUpdater",
            data: {
              roomNum: that.data.roomInfo.roomNum,
              roomID: app.globalData.roomInfo.roomID,
            },
          })
          .then(() => {
            console.log("finish sending notification");
            app.globalData.roomInfo = {
              roomID: null,
              timeStamp: null,
            };
          })
          .catch((err) => {
            console.log("Err: KickRoom - cloud Function");
          });
      }
    };

    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          curRoomid: null,
        },
      });

    wx.switchTab({
      url: "/pages/tradingFloor/tradingFloor",
    }).then(() => {
      if (this.data.kicked) {
        db.collection("Flights")
          .doc(app.globalData.roomInfo.roomID)
          .update({
            data: {
              kickedLst: db.command.pull(app.globalData.roomInfo.timeStamp),
            },
          })
          .then(cloudCall());
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
          .then(cloudCall());
      }
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
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
            });

            db.collection("UsersProfile")
              .doc(userData.data[0]._id)
              .update({
                data: {
                  userInfo: app.globalData.userInfo,
                },
              })
              .then(() => console.log("done"));
            this.setData({
              clientStatus: "no name",
              isTransfering: false,
            });
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
                  news: {},
                  selling: {},
                  buying: {},
                  history: {},
                },
              },
              success: (userData) => {
                console.log(userData);
                app.globalData.id = userData._id;
                this.setData({
                  clientStatus: "no name",
                  isTransfering: false,
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
  onUnload: function () {
    this.data.watcher1.close();
    this.data.watcher2.close();
  },
});

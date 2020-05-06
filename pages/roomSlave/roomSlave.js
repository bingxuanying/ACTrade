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
    roomInfo: {
      code: null,
      people: 0,
      roomNum: "",
    },
    Slaves: [],
    timeStamp: "",
    closeBtnClick: false,
    // page 0 -> line page, page 1 -> setting page
    page: 0,
    firstTimeLoad: true,
    // settings data
    flight: "Business",
    price: 500,
    code: "",
    time: 6,
    people: 3,
    note: "",
    // nav-bar
    statusBarHeight: app.globalData.statusBarHeight,
    // onLoad check status
    clientStatus: "ok", // no auth -> no name -> ok
    nickname: "",
    islandName: "",
    fruit: "apple",
    hemisphere: "north",
  },
  onLoad: function (query) {
    if (query.room_id) {
      console.log(query.room_id);
      app.globalData.roomInfo.roomID = query.room_id;
      // registered
      if (app.globalData.userInfo) {
        if (
          app.globalData.gameProfile.nickname.length > 0 &&
          app.globalData.gameProfile.islandName.length > 0
        ) {
          app.globalData.roomInfo.timeStamp = util.formatTime();
          this.setData({timeStamp: app.globalData.roomInfo.timeStamp})
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
                    this.setData({timeStamp: app.globalData.roomInfo.timeStamp})
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
  },
  checkin: function () {
    console.log(app.globalData);

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          slaves: db.command.push({
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
              code: res.data.code,
              people: res.data.people,
              roomNum: res.data.roomNum,
            },
            timeStamp: app.globalData.roomInfo.timeStamp,
            flight: res.data.flight,
            price: res.data.price,
            code: res.data.code,
            time: res.data.time,
            people: res.data.people,
            note: res.data.note,
          });
        },
      });

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .watch({
        onChange: (snapshot) => {
          //监控数据发生变化时触发
          this.setData({
            Slaves: snapshot.docs[0].slaves,
          });
          console.log(this.data.Slaves);
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
    console.log(this.data.closeBtnClick);
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
    console.log("close");

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
      });

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
      title: "Join the Room#" + this.data.roomInfo.roomNum,
      path:
        "/pages/roomSlave/roomSlave?room_id=" + app.globalData.roomInfo.roomID,
      imageUrl: "../../assets/SharePage.png",
    };
  },
  onTapBack: function() {
    app.globalData.roomInfo = {
      roomID: null,
      timeStamp: null,
    };

    // wx.navigateBack()
    wx.switchTab({
      url: "/pages/tradingFloor/tradingFloor",
    });
  },
  onTapRegister: function(e) {
    console.log(e)

    if (e.detail.errMsg === "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo;

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
              }
            });

            this.setData({clientStatus: "no name"});

          } else {
            db.collection("UsersProfile").add({
              data: {
                userInfo: app.globalData.userInfo,
                nickname: "",
                islandName: "",
                fruit: "apple",
                hemisphere: "north",
              },
              success: (userData) => {
                app.globalData.id = userData.data[0]._id;
                this.setData({clientStatus: "no name"});
              },
            });
          }
        },
      });
    }
  },
  onTapEnter: function() {
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          nickname: this.data.nickname,
          islandName: this.data.islandName
        },
        success: (res) => {
          app.globalData.gameProfile.nickname = this.data.nickname
          app.globalData.gameProfile.islandName = this.data.islandName
          app.globalData.roomInfo.timeStamp = util.formatTime();
          this.setData({timeStamp: app.globalData.roomInfo.timeStamp})
          this.checkin()
          this.setData({ clientStatus: "ok" });
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
});

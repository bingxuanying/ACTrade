// pages/roomMaster/roomMaster.js
const app = getApp();
const db = wx.cloud.database();

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
    isLoading: false,
    closeBtnClick: false,
    showModal: false,
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
    // kicked timeStamp
    kickedPerson: null,
  },
  onLoad: function () {
    this.setData({ isLoading: true });

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .get({
        success: (res) => {
          var master = res.data.master;
          console.log(master);
          this.setData({
            MasterInfo: {
              avatar: master.userInfo.avatarUrl,
              islandName: master.gameProfile.islandName,
              masterName: master.gameProfile.nickname,
              fruit: master.gameProfile.fruit,
              hemisphere: master.gameProfile.fruit,
              roomNum: res.data.roomNum,
            },
            roomInfo: {
              code: res.data.code,
              people: res.data.people,
              roomNum: res.data.roomNum,
            },
            Slaves: res.data.slaves,
            flight: res.data.flight,
            price: res.data.price,
            code: res.data.code,
            time: res.data.time,
            people: res.data.people,
            note: res.data.note,
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
          });
        },
        onError: (err) => {
          console.error(err);
        },
      });
    // cloud url
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

  // settings: data update
  setPublic: function () {
    this.setData({
      flight: "Business",
    });
  },
  setPrivate: function () {
    this.setData({
      flight: "Private",
    });
  },
  bindPriceInput: function (e) {
    var priceAdjust = e.detail.value.replace(/\D+/g, "");
    this.setData({
      price: priceAdjust ? parseInt(priceAdjust, 10) : 0,
    });
    console.log("price: " + this.data.price);
  },
  bindCodeInput: function (e) {
    this.setData({
      code: e.detail.value.toUpperCase(),
    });
    console.log("code: " + this.data.code);
  },
  bindSliderPeople: function (e) {
    console.log("limitOfPeople: " + e.detail.value);
    this.setData({
      people: e.detail.value,
    });
  },
  bindNoteInput: function (e) {
    console.log("note: " + e.detail.value);
    this.setData({
      note: e.detail.value,
    });
  },
  onTapUpdate: function () {
    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          flight: this.data.flight,
          price: this.data.price,
          code: this.data.code,
          time: this.data.time,
          people: this.data.people,
          note: this.data.note,
        },
        success: (res) => {
          console.log(res);
        },
      });
  },
  onTapDeleteBtn: function (e) {
    this.setData({
      showModal: true,
      kickedPerson: e.currentTarget.dataset.x,
    });
  },
  modalHide: function (e) {
    this.setData({
      closeBtnClick: false,
      showModal: false,
    });
  },
  onTapKickOut: function () {
    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          slaves: db.command.pull(this.data.kickedPerson),
          kickedLst: db.command.push(this.data.kickedPerson.timeStamp),
        },
      });

    this.setData({
      kickedPerson: null,
      showModal: false,
    });
  },
  onTapClose: function () {
    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          status: "closed",
        },
      });

    app.globalData.roomInfo = {
      roomID: null,
      timeStamp: null,
    };

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
});

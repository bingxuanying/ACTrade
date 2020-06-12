// pages/roomMaster/roomMaster.js
const app = getApp();
const db = wx.cloud.database();
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
    roomInfo: {
      roomNum: "",
      // settings data
      flight: "Business",
      price: 500,
      time: 6,
      note: "",
      code: null,
      people: 0,
    },
    Slaves: [],
    isLoading: false,
    closeBtnClick: false,
    showModal: false,
    // page 0 -> line page, page 1 -> setting page
    page: 0,
    firstTimeLoad: true,
    // nav-bar
    statusBarHeight: app.globalData.statusBarHeight,
    // kicked timeStamp
    kickedPerson: null,
    isSaving: false,
    watcher: null,
  },
  onLoad: function () {
    this.setData({
      isLoading: true,
      statusBarHeight: app.globalData.statusBarHeight,
    });

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
              flight: res.data.flight,
              price: res.data.price,
              time: res.data.time,
              note: res.data.note,
            },
            Slaves: res.data.slaves,
          });

          this.setData({ isLoading: false });
        },
      });

    this.data.watcher = db
      .collection("Flights")
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
    this.setData({
      EarthLoadingUrl: iu.imgUrl.gif.EarthLoading,
      IslandLoadingUrl: iu.imgUrl.gif.IslandLoading,
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

  // settings: data update
  setPublic: function () {
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        flight: "Business",
      },
    });
  },
  setPrivate: function () {
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        flight: "Private",
      },
    });
  },
  bindPriceInput: function (e) {
    var priceAdjust = e.detail.value.replace(/\D+/g, "");
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        price: priceAdjust ? parseInt(priceAdjust, 10) : 0,
      },
    });
    console.log("price: " + this.data.price);
  },
  bindCodeInput: function (e) {
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        code: e.detail.value.toUpperCase(),
      },
    });
    console.log("code: " + this.data.roomInfo.code);
  },
  bindSliderPeople: function (e) {
    console.log("limitOfPeople: " + e.detail.value);
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        people: e.detail.value,
      },
    });
  },
  bindNoteInput: function (e) {
    console.log("note: " + e.detail.value);
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        note: e.detail.value,
      },
    });
    console.log(this.data.roomInfo);
  },
  onTapUpdate: function () {
    this.setData({
      isSaving: true,
    });

    console.log(app.globalData.roomInfo.roomID);

    db.collection("Flights")
      .doc(app.globalData.roomInfo.roomID)
      .update({
        data: {
          flight: this.data.roomInfo.flight,
          price: this.data.roomInfo.price,
          code: this.data.roomInfo.code,
          people: this.data.roomInfo.people,
          note: this.data.roomInfo.note,
        },
        success: (res) => {
          console.log(res);
          this.setData({
            isSaving: false,
          });
        },
        fail: (err) => {
          console.log(err);
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
      })
      .then(() => {
        this.setData({
          kickedPerson: null,
          showModal: false,
        });
      })
      .catch((err) => {
        console.log("kick out err: ");
        console.log(err);
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

    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          curRoomid: null,
          isMaster: false,
        },
      });

    app.globalData.roomInfo = {
      roomID: null,
      timeStamp: null,
    };

    wx.switchTab({
      url: "/pages/vegiStock/vegiStock",
    });
  },
  onShareAppMessage: function (res) {
    console.log(res);
    return {
      title: "来卖大头菜啦！！房间号是" + this.data.roomInfo.roomNum,
      path:
        "/pages/roomSlave/roomSlave?room_id=" + app.globalData.roomInfo.roomID,
      imageUrl:
        "https://7665-vegi-exchange-45j4z-1301890684.tcb.qcloud.la/dev/img/SharePage.png",
    };
  },
  onUnload: function () {
    this.data.watcher.close();
  },
});

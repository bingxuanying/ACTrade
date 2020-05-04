// pages/roomSlave/roomSlave.js
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
      people: 0
    },
    Slaves: [],
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
  },
  onLoad: function () {
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
            },
            roomInfo: {
              code: res.data.code,
              people: res.data.people
            },
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
  modalHide: function (e) {
    this.setData({
      closeBtnClick: false,
      showModal: false,
    });
  },
  onTapClose: function () {
    console.log("close");
  },
});

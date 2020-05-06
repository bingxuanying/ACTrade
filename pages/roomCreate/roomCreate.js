// pages/roomCreate/roomCreate.js
const app = getApp();
const util = require("../../utils/util");

Page({
  data: {
    flight: "Business",
    price: 500,
    code: "",
    time: 6,
    people: 3,
    note: "随便带点什么都可以~！",
  },
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
  bindSliderTime: function (e) {
    console.log("time: " + e.detail.value);
    this.setData({
      time: e.detail.value,
    });
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
  onTapBack: function () {
    wx.navigateBack();
  },
  onTapCreate: function () {
    const db = wx.cloud.database();
    var roomNum = Math.floor(Math.random() * 1000).toString();
    var roomChar =
      app.globalData.gameProfile.hemisphere === "north" ? "N" : "S";

    switch (app.globalData.gameProfile.fruit) {
      case "apple":
        roomChar += "A";
        break;
      case "cherry":
        roomChar += "C";
        break;
      case "orange":
        roomChar += "O";
        break;
      case "peach":
        roomChar += "P";
        break;
      case "pear":
        roomChar += "L";
        break;
    }

    db.collection("Flights").add({
      data: {
        master: {
          userInfo: app.globalData.userInfo,
          gameProfile: app.globalData.gameProfile,
        },
        slaves: [],
        flight: this.data.flight,
        price: this.data.price,
        code: this.data.code,
        time: this.data.time,
        timeLeft: this.data.time * 60,
        people: this.data.people,
        note: this.data.note,
        roomNum: roomChar + "0".repeat(3 - roomNum.length) + roomNum,
        createTime: util.formatTime(),
        kickedLst: [],
        status: "online",
      },
      success: function (res) {
        app.globalData.roomInfo.roomID = res._id;
        wx.redirectTo({
          url: "/pages/roomMaster/roomMaster",
        });
      },
    });
  },
});

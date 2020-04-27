// pages/roomCreate/roomCreate.js
Page({
  data: {
    flight: 0,
    price: 500,
    code: '',
    time: 6,
    people: 3,
    note: '随便带点什么都可以~！'
  },
  setPublic: function() {
    this.setData({
      flight: 0
    })
  },
  setPrivate: function() {
    this.setData({
      flight: 1
    })
  },
  bindPriceInput: function(e) {
    var priceAdjust = e.detail.value.replace(/\D+/g, '')
    this.setData({
      price: priceAdjust ? parseInt(priceAdjust, 10) : 0
    })
    console.log('price: ' + this.data.price)
  },
  bindCodeInput: function(e) {
    this.setData({
      code: e.detail.value.toUpperCase()
    })
    console.log('code: ' + this.data.code)
  },
  bindSliderTime: function(e) {
    console.log('time: ' + e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  bindSliderPeople: function(e) {
    console.log('limitOfPeople: ' + e.detail.value)
    this.setData({
      people: e.detail.value
    })
  },
  bindNoteInput: function(e) {
    console.log('note: ' + e.detail.value)
    this.setData({
      note: e.detail.value
    })
  },
  onTapBack: function() {
    wx.navigateBack({
      complete: (res) => {
        console.log(res)
      },
    })
  },
  onTapCreate: function() {
    const db = wx.cloud.database();
    var dbName = this.data.flight === 0 ? 'BusinessFlights' : 'PrivateFlights';
    var roomNum = Math.floor(Math.random() * 1000).toString();

    db.collection(dbName).add({
      data: {
        flight: this.data.flight,
        price: this.data.price,
        code: this.data.code,
        time: this.data.time,
        people: this.data.people,
        note: this.data.note,
        roomNum: '0'.repeat(3 - roomNum.length) + roomNum
      },
      success: function(res) {
        console.log(res)
      }
    })
  }
})
// pages/roomCreate/roomCreate.js
const app = getApp();

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
      code: e.detail.value.toUpperCase(),
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
    const db = wx.cloud.database()
    var dbName = this.data.flight === 0 ? 'BusinessFlights' : 'PrivateFlights'
    var roomNum = Math.floor(Math.random() * 1000).toString()
    var roomChar = app.globalData.gameProfile.hemisphere === 'north' ? 'N' : 'S'

    switch(app.globalData.gameProfile.fruit) {
      case 'apple':
        roomChar += 'A'
        break;
      case 'cherry':
        roomChar += 'C'
        break;
      case 'orange':
        roomChar += 'O'
        break;
      case 'peach':
        roomChar += 'P'
        break;
      case 'pear':
        roomChar += 'L'
        break;
    }

    function getDate() {
      var date = new Date(),
          month = (date.getMonth() + 1).toString(),
          day = date.getDate().toString(),
          hr = date.getHours().toString(),
          min = date.getMinutes().toString(),
          sec = date.getSeconds().toString(),
          milisec = date.getMilliseconds().toString();
      if (day.length < 2) 
        day = '0' + day;
      if (hr.length < 2) 
        hr = '0' + hr;
      if (min.length < 2) 
        min = '0' + min;
      if (sec.length < 2) 
        sec = '0' + sec;
      milisec = '0'.repeat(3 - milisec.length) + milisec;
  
      return parseInt(month + day + hr + min + sec + milisec, 10);
    }

    db.collection(dbName).add({
      data: {
        master: {
          userInfo: app.globalData.userInfo,
          gameProfile: app.globalData.gameProfile,
        },
        slaves: [],
        price: this.data.price,
        code: this.data.code,
        time: this.data.time,
        people: this.data.people,
        note: this.data.note,
        roomNum: roomChar + '0'.repeat(3 - roomNum.length) + roomNum,
        createTime: getDate()
      },
      success: function(res) {
        app.globalData.roomInfo.roomID = res._id
        app.globalData.roomInfo.type = dbName
        wx.redirectTo({
          url: '/pages/roomMaster/roomMaster',
        })
      }
    })
  }
})
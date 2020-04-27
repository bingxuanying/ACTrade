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
    };

    db.collection(dbName).add({
      data: {
        flight: this.data.flight,
        price: this.data.price,
        code: this.data.code,
        time: this.data.time,
        people: this.data.people,
        note: this.data.note,
        roomNum: '0'.repeat(3 - roomNum.length) + roomNum,
        creatTime: getDate()
      },
      success: function(res) {
        // enter master room
        console.log(res)
      }
    })
  }
})
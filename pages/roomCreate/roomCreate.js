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
    console.log('price: ' + e.detail.value)
    this.setData({
      price: e.detail.value
    })
  },
  bindCodeInput: function(e) {
    console.log('code: ' + e.detail.value)
    this.setData({
      code: e.detail.value
    })
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
  }
})
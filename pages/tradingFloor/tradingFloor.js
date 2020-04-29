// pages/tradingFloor/tradingFloor.js
const db = wx.cloud.database();

Page({
  data: {
    isLoading: false,
    offset: 0,
    order: 'time',
    showModal: false,
    keyword: '',
    cards: [],
  },
  onLoad: function() {
    db.collection('BusinessFlights')
    .orderBy('creatTime', 'desc')
    .skip(this.data.offset)
    .limit(10)
    .get({
      success: res => {
        console.log(res.data);
        this.setData({
          cards: res.data
        })
      }
    })
  },
  onTapSearch: function() {

  },
  onTapCreate: function() {
    wx.navigateTo({
      url: '/pages/roomCreate/roomCreate',
      complete: (res) => {
        console.log(res)
      }
    })
  },
  onTapTime: function() {
    this.setData({
      order:'time'
    })
  },
  onTapPrice: function() {
    this.setData({
      order:'price'
    })
  },
  modalOpen: function(e) {
    this.setData({
      showModal: true
    })
  },
  modalHide: function(e) {
    this.setData({
      showModal: false,
      keyword: ''
    })
  },
  bindSearchBar: function(e) {
    this.setData({
      keyword: e.detail.value.toUpperCase()
    });
    console.log('keyword: ' + this.data.keyword)
  },
  onTapSearch: function() {

  }
})
// pages/tradingFloor/tradingFloor.js
const db = wx.cloud.database();

Page({
  data: {
    isLoading: false,
    offset: 0,
    order: 'time',
    showModal: false,
    keyword: 'none'
  },
  onLoad: function() {
    db.collection('BusinessFlights')
    .orderBy('creatTime', 'desc')
    .skip(this.data.offset)
    .limit(10)
    .get({
      success: function(res) {
        // res.data 是包含以上定义的两条记录的数组
        console.log(res.data)
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
      showModal: false
    })
  },
})
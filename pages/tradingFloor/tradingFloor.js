// pages/tradingFloor/tradingFloor.js
const db = wx.cloud.database();

Page({
  data: {
    isLoading: false,
    offset: 0,
    order: 'createTime',
    showModal: false,
    keyword: '',
    cards: [],
  },
  onLoad: function() {
    this.setData({
      isLoading: true
    })
    db.collection('Flights')
    .where({
      flight: "Business"
    })
    .orderBy(this.data.order, 'desc')
    .skip(this.data.offset)
    .limit(10)
    .get({
      success: res => {
        console.log(res.data);
        this.setData({
          cards: res.data,
          isLoading: false
        })
      }
    })
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
    if (this.data.order === 'price') {
      this.setData({
        order:'createTime',
        isLoading: true
      })
  
      if (this.data.keyword.length === 5) {
        db.collection('Flights')
        .where({
          roomNum: this.data.keyword
        })
        .orderBy(this.data.order, 'desc')
        .get({
          success: res => {
            this.setData({
              cards: res.data,
              offset: 0,
              isLoading: false
            })
          }
        });
      }
      else {
        db.collection('Flights')
        .where({
          flight: 'Business'
        })
        .orderBy(this.data.order, 'desc')
        .skip(0)
        .limit(10)
        .get({
          success: res => {
            this.setData({
              cards: res.data,
              offset: 0,
              isLoading: false
            })
          }
        })
      }
    }
  },
  onTapPrice: function() {
    if (this.data.order === 'createTime') {
      this.setData({
        order:'price',
        isLoading: true
      })
  
      if (this.data.keyword.length === 5) {
        db.collection('Flights')
        .where({
          roomNum: this.data.keyword
        })
        .orderBy(this.data.order, 'desc')
        .get({
          success: res => {
            this.setData({
              cards: res.data,
              offset: 0,
              isLoading: false
            })
          }
        })
      }
      else{
        db.collection('Flights')
        .where({
          flight: 'Business'
        })
        .orderBy(this.data.order, 'desc')
        .skip(0)
        .limit(10)
        .get({
          success: res => {
            this.setData({
              cards: res.data,
              offset: 0,
              isLoading: false
            })
          }
        })
      }
    }
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
    this.setData({
      showModal: false,
      isLoading: true
    })

    db.collection('Flights')
    .where({
      roomNum: this.data.keyword
    })
    .orderBy(this.data.order, 'desc')
    .get({
      success: res => {
        this.setData({
          cards: res.data,
          offset: 0,
          isLoading: false
        })
      }
    });
  },
  onTapCancel: function() {
    this.setData({
      isLoading: true,
      keyword: ''
    })

    db.collection('Flights')
    .where({
      flight: 'Business'
    })
    .orderBy(this.data.order, 'desc')
    .skip(0)
    .limit(10)
    .get({
      success: res => {
        this.setData({
          cards: res.data,
          offset: 0,
          isLoading: false
        })
      }
    })
  }
})
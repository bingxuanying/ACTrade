// pages/profile/profile.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    nickname: '',
    islandName: '',
    fruit: 'apple',
    hemishpere: 'north',
    isNorth: true,
    isClick: false
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindNicknameInput: function(e) {
    this.setData({
      nickname: e.detail.value
    })
    console.log('nickname: ' + this.data.nickname)
  },
  bindIslandNameInput: function(e) {
    this.setData({
      islandName: e.detail.value
    })
    console.log('islandName: ' + this.data.islandName)
  },
  onTapApple: function() {
    this.setData({
      fruit: 'apple'
    })
  },
  onTapCherry: function() {
    this.setData({
      fruit: 'cherry'
    })
  },
  onTapOrange: function() {
    this.setData({
      fruit: 'orange'
    })
  },
  onTapPeach: function() {
    this.setData({
      fruit: 'peach'
    })
  },
  onTapPear: function() {
    this.setData({
      fruit: 'pear'
    })
  },
  changeSwitch: function(i) {
    this.setData({isClick:true})
    if (this.data.hemishpere == "north") {
      this.setData({hemishpere:"south", isNorth: false});
    }else {
      this.setData({hemishpere:"north", isNorth: true})
    }
    // console.log(this.data.hemishpere);
    // console.log(this.data.isNorth);
  },
  onTapDone: function() {
    db.collection('UsersProfile').add({
      data: {
        userInfo: this.data.userInfo,
        nickname: this.data.nickname,
        islandName: this.data.islandName,
        fruit: this.data.fruit,
        hemishpere: this.data.hemishpere,
      },
      success: function(res) {
        // back to lobby
        console.log(res)
        wx.navigateTo({
          url: 'pages/tradingFloor/tradingFloor',
        })
      }
    })
  },
})

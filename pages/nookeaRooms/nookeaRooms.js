// pages/nookeaRooms/nookeaRooms.js

const app = getApp();
const db = wx.cloud.database();
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;
const util = require("../../utils/util");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: {
      isRefresh: false,
      isBottom: false
    },
    gif: {
      EarthLoadingUrl: null,
    },
    currentRoom: "982133855ec0a22f00dc2b0703e78dc7",
    db: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      loading: {
        ...this.data.loading,
        isRefresh: true,
      },
      gif: {
        ...this.data.gif,
        EarthLoadingUrl: iu.gif.EarthLoading,
      },
    });

    if (app.globalData.userInfo) {
      this.setData({
        openid: app.globalData.gameProfile._openid
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        // onLaunch -> onLoad -> onLaunch: has to get data here
        if (res.userInfo) {
          this.setData({
            openid: app.globalData.gameProfile._openid
          });
        }
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
      db.collection("UsersProfile")
      .get()
      .then((res) => {
        if (res.data.length > 0) {
          app.globalData.gameProfile._openid = res.data[0]._openid
          this.setData({
            openid: app.globalData.gameProfile._openid
          });
        }
      })
      .catch((err) => {
        console("profile onload getuserinfo err: ");
        console(err);
      });
    }

    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .get()
      .then(res => {
        res.data.notes = res.data.notes.map(t => {
          t.conversations.sort((a, b) => a.timestamp - b.timestamp)
          if (t.slaveInfo._openid !== this.data.openid && res.data.masterInfo._openid !== this.data.openid) {
            t.conversations = [t.conversations[0]]
          }
          return t
        })
        console.log(res.data)
        this.setData({
          db: res.data,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });

    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .watch({
        onChange: (snapshot) => {
          snapshot.docs[0].notes = snapshot.docs[0].notes.map(t => {
            t.conversations.sort((a, b) => b.timestamp - a.timestamp)
            if (t.slaveInfo._openid !== this.data.openid && res.data.masterInfo._openid !== this.data.openid) {
              t.conversations = [t.conversations[0]]
            }
            return t
          })
          //监控数据发生变化时触发
          this.setData({
            db: snapshot.docs[0]
          });
        },
        onError: (err) => {
          console.error(err);
        },
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
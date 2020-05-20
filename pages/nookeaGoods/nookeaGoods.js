// pages/nookeaGoods/nookeaGoods.js
const app = getApp();
const db = wx.cloud.database();
// gif
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    productInfo: null,
    rooms: [],
    offset: 0,
    loading: {
      isRefresh: false,
      isBottom: false
    },
    gif: {
      EarthLoadingUrl: null,
    },
  },

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
    })
    // let product_id = options._id //
    let product_id = '05f2c36f5ebd2e7200d107826abdcfc1'
    
    db.collection("Nookea-items")
      .doc(product_id)
      .get()
      .then(res => {
        console.log(res.data)
        this.setData({ productInfo: res.data })
        return res.data._id
      })
      .then(item_id => {
        db.collection("Nookea-rooms")
        .skip(this.data.offset)
        .limit(10)
        .where({
          itemInfo: {
            _id: item_id
          }
        })
        .orderBy("timestamp", "desc")
        .get()
        .then(res => this.setData({ 
          rooms: res.data,
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        }))
      })
  },
  
  onPullDownRefresh: function () {
    this.setData({
      offset: 0,
      loading: {
        ...this.data.loading,
        isRefresh: true,
      },
    });
    wx.stopPullDownRefresh({
      complete: () => {
        db.collection("Nookea-rooms")
        .skip(this.data.offset)
        .limit(10)
        .where({
          itemInfo: {
            _id: this.data.productInfo._id
          }
        })
        .orderBy("timestamp", "desc")
        .get()
        .then(res => this.setData({ 
          rooms: res.data,
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        }));
      },
    });
  },

  onReachBottom: function () {
    this.setData({
      offset: 0,
      loading: {
        ...this.data.loading,
        isBottom: true,
      },
    });

    db.collection("Nookea-rooms")
    .skip(this.data.offset)
    .limit(10)
    .where({
      itemInfo: {
        _id: this.data.productInfo._id
      }
    })
    .orderBy("timestamp", "desc")
    .get()
    .then(res => this.setData({ 
      rooms: this.data.rooms.concat(res.data),
      offset: this.data.offset + res.data.length,
      loading: {
        ...this.data.loading,
        isBottom: false,
      },
    }));
  },

  onTapPost: function(e) {
    let _itemInfo = e.currentTarget.dataset.iteminfo;
    let _masterInfo = {
      _openid: app.globalData.openid,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      gender: app.globalData.userInfo.gender,
      nickname: app.globalData.gameProfile.nickname,
      islandName: app.globalData.gameProfile.islandName,
      wishlist: app.globalData.gameProfile.wishlist,
    }
    console.log(_masterInfo);
    console.log(_itemInfo);
  },
})
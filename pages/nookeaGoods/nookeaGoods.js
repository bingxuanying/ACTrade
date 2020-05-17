// pages/nookeaGoods/nookeaGoods.js
const app = getApp();
const db = wx.cloud.database();
// gif
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    productInfo: null,
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
      gif: {
        ...this.data.gif,
        EarthLoadingUrl: iu.gif.EarthLoading,
      },
    })
    // let product_id = options._id //
    let product_id = '05f2c36f5ebcde4200c9b5701c8f445e'
    
    db.collection("Nookea-items")
      .doc(product_id)
      .get()
      .then(res => {
        console.log(res.data)
        this.setData({ productInfo: res.data })
      })
  },


})
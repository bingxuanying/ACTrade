// pages/nookea/nookea
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    page: 'cat', // cat, specs
    catDeck: ['A', 'B', 'C'],
    specsDeck: [],
    curtain: {
      activateFilter: false,
      filter: false,
      activateSearch: false,
      search: false,
    },
    loading: {
      isPull: false,
      isBottom: false
    }
  },
  onLoad: function () {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })

    /***************** CallBack function Template Here ******************** */
    var that = this;
    app.UrlCallBack(
      function (res) {
        that.setData({ EarthLoadingUrl: res.gif.EarthLoading  });
      },
      "gif",
      "EarthLoadingUrl"
    );
    /*************************************************** */
  },
  onTapFilter: function() {
    if (this.data.curtain.activateFilter === false) {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          activateFilter: true
        }  
      })
    }

    if (this.data.curtain.filter === false) {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          filter: true,
          search: false,
        }  
      })
    } else {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        }  
      })
    }

    console.log(this.data.curtain)
  },
  onTapSearch: function() {
    if (this.data.curtain.activateSearch === false) {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          activateSearch: true
        }  
      })
    }

    if (this.data.curtain.search === false) {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: true,
        }  
      })
    } else {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        }  
      })
    }

    console.log(this.data.curtain)
  },
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1, // 根据tab的索引值设置
      });
    }
  },
  onReady() {
    var that = this;
    setTimeout(function () {
      that.setData({
        isLoading: false,
      });
    }, 500);
  },
});

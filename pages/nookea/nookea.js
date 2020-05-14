// pages/nookea/nookea
const app = getApp();
const db = wx.cloud.database();
// gif
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    page: 'cat', // cat, specs
    catDeck: [],
    specsDeck: [],
    specs: null,
    keyword: {
      words: '',
      tags: []
    },
    curtain: {
      activateFilter: true,
      filter: true,
      activateSearch: false,
      search: false,
    },
    loading: {
      isRefresh: false,
      isBottom: false
    },
    gif: {
      EarthLoadingUrl: null,
    },
  },


  onLoad: function() {
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

    db.collection("Nookea")
      .orderBy('disable', 'asc')
      .get()
      .then(res => {
        console.log(res.data)
        this.setData({
          page: 'cat',
          catDeck: res.data,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });

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
  

  onReachBottom: function () {
    if (this.data.page === 'specs'){
      this.setData({
        loading: {
          ...this.data.loading,
          isBottom: true,
        }
      });

      db.collection(this.data.specs.name)
        .skip(this.data.specs.offset)
        .limit(18)
        .get()
        .then(res => {
          this.setData({
            specsDeck: this.data.specsDeck.concat(res.data),
            specs: {
              ...this.data.specs,
              offset: this.data.specs.offset + res.data.length,
            },
            loading: {
              ...this.data.loading,
              isBottom: false,
            }
          });
        })        
    }
  },

  
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1, // 根据tab的索引值设置
      });
    }
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

    this.setData({  
      curtain: {
        ...this.data.curtain,
        filter: !this.data.curtain.filter,
        search: false,
      }
    })

    // console.log(this.data.curtain)
  },
  onTapSearchBtn: function() {
    if (this.data.curtain.activateSearch === false) {
      this.setData({  
        curtain: {
          ...this.data.curtain,
          activateSearch: true
        }  
      })
    }
    
    this.setData({  
      curtain: {
        ...this.data.curtain,
        filter: false,
        search: !this.data.curtain.search,
      }
    })
    // console.log(this.data.curtain)
  },


  bindSearchVal: function(e) {
    console.log(e.detail.value)
    this.setData({
      keyword: {
        ...this.data.keyword,
        words: e.detail.value,
      },
    })
  },


  onTapSearchVal: function() {
    if (this.data.keyword.words.length > 0) {
      this.setData({
        keyword: {
          ...this.data.keyword,
          tags: [],
        },      
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        },
      })

      console.log(this.data.keyword)
    }
  },



  onTapCategory: function(e) {
    let _info =  e.currentTarget.dataset.info
    
    if (!_info.disable) {
      this.setData({  
        specs: {
          name: _info.name,
          zh_name: _info.zh_name,
          categories: _info.categories,
          types: _info.types,
          offset: 18,
        },
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
      })
      console.log(this.data.specs)
      
      db.collection(this.data.specs.name)
        .skip(0)
        .limit(18)
        .get()
        .then(res => {
          console.log(res.data)
          this.setData({
            page: 'specs',
            specsDeck: res.data,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          })
        })
    }
  },


  onTapHieCurtain: function() {
    this.setData({
      curtain: {
        ...this.data.curtain,
        filter: false,
        search: false,
      },
    })
  },
});

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
    offset: 0,
    keyword: {
      searchType: null, // filter, search
      words: '',
      tags: {}
    },
    curtain: {
      activateFilter: false,
      filter: false,
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

      let filterCondition = this.data.keyword.searchType === 'search' ? 
                            this.data.keyword.words : this.data.keyword.tags;

      this.fetchData(
        filterCondition, 
        this.data.offset)
        .then(res => {
          this.setData({
            specsDeck: this.data.specsDeck.concat(res.data),
            offset: this.data.offset + res.data.length,
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

  // --- MODAL ---
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
  
  // --- MODAL: Filter ---
  onTapFilterCat: function(e) {
    let _info =  e.currentTarget.dataset.info
    
    if (!_info.disable) {
      this.setData({  
        specs: {
          name: _info.name,
          zh_name: _info.zh_name,
          categories: _info.categories,
          types: _info.types,
        },
        keyword: {
          ...this.data.keyword,
          tags: {
            ['collection']: _info.zh_name
          },
        },
      })
      console.log(this.data.specs)
    }
  },
  
  onTapFilterType: function(e) {
    let _cat = e.currentTarget.dataset.cat;
    let _type =  e.currentTarget.dataset.type;
    this.setData({  
      keyword: {
        ...this.data.keyword,
        tags: {
          ...this.data.keyword.tags,
          [_cat]: _type,
        }
      },
    })
    console.log(this.data.keyword)
  },

  onTapFilterClean: function() {
    if (this.data.specs) {
      this.setData({
        page: 'cat',
        specsDeck: [],
        specs: null,
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        },
        keyword: {
          ...this.data.keyword,
          searchType: null,
          tags: {}
        }
      })
    }
  },

  onTapFilterExec: function() {
    if (this.data.specs) {
      this.setData({  
        offset: 0,
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        },
        keyword: {
          ...this.data.keyword,
          searchType: 'filter',
          words: ''
        }
      });

      this.fetchData(
        this.data.keyword.tags, 
        this.data.offset)
        .then(res => {
          console.log(res.data)
          this.setData({
            page: 'specs',
            specsDeck: res.data,
            offset: this.data.offset + res.data.length,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          })
        })
    }
  },

  // --- MODAL: Search ---
  bindSearchVal: function(e) {
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
        specs: null,
        keyword: {
          ...this.data.keyword,
          searchType: 'search',
          tags: {},
        },
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        },
        offset: 0,
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
      })

      this.fetchData(
        this.data.keyword.words, 
        this.data.offset)
        .then(res => {
          console.log(res.data)
          this.setData({
            page: 'specs',
            specsDeck: res.data,
            offset: this.data.offset + res.data.length,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          })
        })
    }
  },


  // --- Tag Delete ---
  onTapDeleteTag: function(e) {
    let _tag = e.currentTarget.dataset.tag

    if (_tag === 'collection') {
      this.onTapFilterClean()
    }
    else if (_tag === 'search') {
      this.setData({
        page: 'cat',
        specsDeck: [],
        keyword: {
          ...this.data.keyword,
          searchType: null,
          words: ''
        }
      })
    }
    else {
      let tempObj = Object.assign({}, this.data.keyword.tags)
      delete tempObj[_tag]
      this.setData({  
        offset: 0,
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
        keyword: {
          ...this.data.keyword,
          searchType: 'filter',
          words: '',
          tags: tempObj
        }
      });

      this.fetchData(
        this.data.keyword.tags, 
        this.data.offset)
        .then(res => {
          console.log(res.data)
          this.setData({
            page: 'specs',
            specsDeck: res.data,
            offset: this.data.offset + res.data.length,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          })
        })
    }
  },


  // --- Main Board ---
  onTapCategory: function(e) {
    let _info =  e.currentTarget.dataset.info
    
    if (!_info.disable) {
      this.setData({  
        specs: {
          name: _info.name,
          zh_name: _info.zh_name,
          categories: _info.categories,
          types: _info.types,
        },
        offset: 0,
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
        keyword: {
          ...this.data.keyword,
          searchType: 'filter',
          tags: {
            ...this.data.keyword.tags,
            ['collection']: _info.zh_name
          }
        }
      });
      console.log(this.data.specs);

      this.fetchData(
        this.data.keyword.tags, 
        this.data.offset)
        .then(res => {
          console.log(res.data)
          this.setData({
            page: 'specs',
            specsDeck: res.data,
            offset: this.data.offset + res.data.length,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          })
        })
    }
  },

  // --- Mask ---
  onTapHieCurtain: function() {
    this.setData({
      curtain: {
        ...this.data.curtain,
        filter: false,
        search: false,
      },
    })
  },

  // --- general db data fetch ---
  fetchData: (condition, dbSkip) => {
    if (typeof(condition) === 'string') {
      return db.collection("Nookea-items")
        .where({
          zh_name: db.RegExp({  regexp: condition  })
        })
        .skip(dbSkip)
        .limit(18)
        .get()
    } else {
      return db.collection("Nookea-items")
                .where(condition)
                .skip(dbSkip)
                .limit(18)
                .get()
    }
  },
});

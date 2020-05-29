// pages/nookea/nookea
const app = getApp();
const db = wx.cloud.database();
// gif
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    page: "cat", // cat, specs, collect
    catDeck: [],
    specsDeck: [],
    specs: null,
    offset: 0,
    // onLoad check status
    clientStatus: "ok", // no auth -> no name -> ok
    collect: {
      mode: false,
      wishlist: {},
      tradeHistory: {},
    },
    keyword: {
      searchType: null, // filter, search
      words: "",
      tags: {},
    },
    curtain: {
      activateFilter: false,
      filter: false,
      activateSearch: false,
      search: false,
    },
    loading: {
      isRefresh: false,
      isBottom: false,
      isTransfer: false,
      isEnter: false,
    },
    input: {
      nickname: "",
      islandName: "",
    },
    gif: {
      EarthLoadingUrl: null,
    },
  },

  onLoad: function () {
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
      .orderBy("disable", "asc")
      .orderBy("order", "asc")
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({
          page: "cat",
          catDeck: res.data,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });
  },

  onReachBottom: function () {
    if (this.data.page === "specs") {
      this.setData({
        loading: {
          ...this.data.loading,
          isBottom: true,
        },
      });

      let filterCondition =
        this.data.keyword.searchType === "search"
          ? this.data.keyword.words
          : this.data.keyword.tags;

      this.fetchData(filterCondition, this.data.offset).then((res) => {
        this.setData({
          specsDeck: this.data.specsDeck.concat(res.data),
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isBottom: false,
          },
        });
      });
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
  onTapCollect: function () {
    this.setData({
      collect: {
        ...this.data.collect,
        mode: !this.data.collect.mode,
      },
    });

    if (this.data.collect.mode) {
      if (!app.globalData.openid) {
        db.collection("UsersProfile")
          .get()
          .then((res) => {
            if (res.data.length > 0)
              app.globalData.openid = res.data[0]._openid;
          });
      }
    } else {
      console.log("save collection");
      console.log(this.data.collect.tradeHistory)      
      // updata app.globalData.gameProfile
      app.globalData.gameProfile.wishlist = this.data.collect.wishlist;
      // <--------------------- call cloud func ----------------------->
      let that = this;
      wx.cloud
        .callFunction({
          name: "wishlistUpdater",
          data: {
            wishlist: that.data.collect.wishlist,
            tradeHistory: that.data.collect.tradeHistory
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((res) => {
          console.log(res);
        });
    }
  },

  onTapFilter: function () {
    if (this.data.curtain.activateFilter === false) {
      this.setData({
        curtain: {
          ...this.data.curtain,
          activateFilter: true,
        },
      });
    }

    if (this.data.curtain.filter === true) {
      this.onTapFilterExec();
    } else {
      this.setData({
        curtain: {
          ...this.data.curtain,
          filter: !this.data.curtain.filter,
          search: false,
        },
      });
    }
    // console.log(this.data.curtain)
  },

  onTapSearchBtn: function () {
    if (this.data.curtain.activateSearch === false) {
      this.setData({
        curtain: {
          ...this.data.curtain,
          activateSearch: true,
        },
      });
    }
    this.setData({
      curtain: {
        ...this.data.curtain,
        filter: false,
        search: !this.data.curtain.search,
      },
    });
    // console.log(this.data.curtain)
  },

  // --- MODAL: Collect ---
  onTapCollectAdd: function (e) {
    let _info = e.currentTarget.dataset.info;
    console.log(_info.zh_name + "clicked");
    if (this.data.collect.wishlist.hasOwnProperty(_info.zh_name)) {
      let tempObj = Object.assign({}, this.data.collect.wishlist);
      delete tempObj[_info.zh_name];
      this.setData({
        collect: {
          ...this.data.collect,
          wishlist: tempObj,
        },
      });
    } else {
      _info["isUpdated"] = false;
      this.setData({
        collect: {
          ...this.data.collect,
          wishlist: {
            ...this.data.collect.wishlist,
            [_info.zh_name]: _info,
          },
        },
      });
      console.log(this.data.collect.wishlist);
    }
  },

  // --- MODAL: Filter ---
  onTapFilterCat: function (e) {
    let _info = e.currentTarget.dataset.info;
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
            ["collection"]: _info.zh_name,
          },
        },
      });
      console.log(this.data.specs);
    }
  },

  onTapFilterType: function (e) {
    let _cat = e.currentTarget.dataset.cat;
    let _type = e.currentTarget.dataset.type;

    if (
      this.data.keyword.tags.hasOwnProperty(_cat) &&
      _type === this.data.keyword.tags[_cat]
    ) {
      let tempObj = Object.assign({}, this.data.keyword.tags);
      delete tempObj[_cat];
      this.setData({
        keyword: {
          ...this.data.keyword,
          tags: tempObj,
        },
      });
    } else {
      this.setData({
        keyword: {
          ...this.data.keyword,
          tags: {
            ...this.data.keyword.tags,
            [_cat]: _type,
          },
        },
      });
    }
    console.log(this.data.keyword);
  },

  onTapFilterClean: function () {
    if (this.data.specs) {
      this.setData({
        page: "cat",
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
          tags: {},
        },
      });
    }
  },

  onTapFilterExec: function () {
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
          searchType: "filter",
          words: "",
        },
      });

      this.fetchData(this.data.keyword.tags, this.data.offset).then((res) => {
        console.log(res.data);
        this.setData({
          page: "specs",
          specsDeck: res.data,
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });
    }
  },

  // --- MODAL: Search ---
  bindSearchVal: function (e) {
    this.setData({
      keyword: {
        ...this.data.keyword,
        words: e.detail.value,
      },
    });
  },

  onTapSearchVal: function () {
    if (this.data.keyword.words.length > 0) {
      this.setData({
        specs: null,
        keyword: {
          ...this.data.keyword,
          searchType: "search",
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
      });

      this.fetchData(this.data.keyword.words, this.data.offset).then((res) => {
        console.log(res.data);
        this.setData({
          page: "specs",
          specsDeck: res.data,
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });
    }
  },

  // --- Tag Delete ---
  onTapDeleteTag: function (e) {
    let _tag = e.currentTarget.dataset.tag;

    if (_tag === "collection") {
      this.onTapFilterClean();
      if (this.data.collect.mode) this.onTapCollect();
    } else if (_tag === "search") {
      this.setData({
        page: "cat",
        specsDeck: [],
        keyword: {
          ...this.data.keyword,
          searchType: null,
          words: "",
        },
      });
    } else {
      let tempObj = Object.assign({}, this.data.keyword.tags);
      delete tempObj[_tag];
      this.setData({
        offset: 0,
        loading: {
          ...this.data.loading,
          isRefresh: true,
        },
        keyword: {
          ...this.data.keyword,
          searchType: "filter",
          words: "",
          tags: tempObj,
        },
      });

      this.fetchData(this.data.keyword.tags, this.data.offset).then((res) => {
        console.log(res.data);
        this.setData({
          page: "specs",
          specsDeck: res.data,
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });
    }
  },

  // --- Main Board ---
  onTapCategory: function (e) {
    let _info = e.currentTarget.dataset.info;

    if (!_info.disable) {
      if (!app.globalData.userInfo) {
        this.setData({ clientStatus: "no auth" });
      } else if (
        app.globalData.gameProfile.nickname.length === 0 &&
        app.globalData.gameProfile.islandName.length === 0
      ) {
        this.setData({ clientStatus: "no name" });
      } else {
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
            searchType: "filter",
            tags: {
              ...this.data.keyword.tags,
              ["collection"]: _info.zh_name,
            },
          },
        });
        console.log(this.data.specs);

        if (
          !app.globalData.gameProfile.wishlist &&
          !app.globalData.gameProfile.tradetradeHistory
        ) {
          db.collection("UsersProfile")
            .get()
            .then((userData) => {
              if (userData.data.length > 0) {
                app.globalData.id = userData.data[0]._id;
                app.globalData.openid = userData.data[0]._openid;
                app.globalData.gameProfile = {
                  ...app.globalData.gameProfile,
                  nickname: userData.data[0].nickname,
                  islandName: userData.data[0].islandName,
                  fruit: userData.data[0].fruit,
                  hemisphere: userData.data[0].hemisphere,
                  wishlist: userData.data[0].wishlist,
                  tradeHistory: userData.data[0].tradeHistory,
                  wxid: userData.data[0].wxid,
                };
                this.setData({
                  collect: {
                    ...this.data.collect,
                    wishlist: app.globalData.gameProfile.wishlist,
                    tradeHistory: app.globalData.gameProfile.tradeHistory,
                  },
                });
              }
            });
        } else {
          this.setData({
            collect: {
              ...this.data.collect,
              wishlist: app.globalData.gameProfile.wishlist,
              tradeHistory: app.globalData.gameProfile.tradeHistory,
            },
          });
        }

        console.log(this.data.collect);

        this.fetchData(this.data.keyword.tags, this.data.offset).then((res) => {
          console.log(res.data);
          this.setData({
            page: "specs",
            specsDeck: res.data,
            offset: this.data.offset + res.data.length,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          });
        });
      }
    }
  },

  onTapItem: function (e) {
    let _info = e.currentTarget.dataset.info;
    wx.navigateTo({
      url: "/pages/nookeaGoods/nookeaGoods?_id=" + _info._id,
    });
  },

  // --- Auth Modal ---
  onTapRegister: function (e) {
    console.log(e);

    if (e.detail.errMsg === "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        loading: {
          ...this.data.loading,
          isTransfer: true,
        },
      });

      db.collection("UsersProfile").get({
        success: (userData) => {
          if (userData.data.length > 0) {
            console.log("has previous user");
            console.log(userData);
            app.globalData.id = userData.data[0]._id;
            app.globalData.openid = userData.data[0]._openid;
            app.globalData.gameProfile = {
              ...app.globalData.gameProfile,
              nickname: userData.data[0].nickname,
              islandName: userData.data[0].islandName,
              fruit: userData.data[0].fruit,
              hemisphere: userData.data[0].hemisphere,
              wishlist: userData.data[0].wishlist,
              tradeHistory: userData.data[0].tradeHistory,
              wxid: userData.data[0].wxid,
            };

            this.setData({
              collect: {
                ...this.data.collect,
                wishlist: userData.data[0].wishlist
                  ? userData.data[0].wishlist
                  : {},
                tradeHistory: userData.data[0].tradeHistory
                  ? userData.data[0].tradeHistory
                  : {},
              },
              input: {
                nickname: userData.data[0].nickname,
                islandName: userData.data[0].islandName,
              },
            });

            db.collection("UsersProfile")
              .doc(app.globalData.id)
              .update({
                data: {
                  userInfo: app.globalData.userInfo,
                },
              });
            this.setData({
              clientStatus: "no name",
              loading: {
                ...this.data.loading,
                isTransfer: false,
              },
            });
          } else {
            console.log("no previous user");
            db.collection("UsersProfile").add({
              data: {
                userInfo: app.globalData.userInfo,
                nickname: "",
                islandName: "",
                fruit: "apple",
                hemisphere: "north",
                wxid: "",
                subscription: false,
                curRoomid: null,
                isMaster: false,
                wishlist: {},
                tradeHistory: {
                  news: {},
                  selling: {},
                  buying: {},
                  history: {},
                },
              },
              success: (userData) => {
                console.log(userData);
                app.globalData.id = userData._id;
                this.setData({
                  clientStatus: "no name",
                  loading: {
                    ...this.data.loading,
                    isTransfer: false,
                  },
                });
              },
            });
          }
        },
      });
    }
  },

  onTapEnter: function () {
    this.setData({
      loading: {
        ...this.data.loading,
        isEnter: true,
      },
    });
    db.collection("UsersProfile")
      .doc(app.globalData.id)
      .update({
        data: {
          nickname: this.data.input.nickname,
          islandName: this.data.input.islandName,
        },
      })
      .then(() => {
        app.globalData.gameProfile.nickname = this.data.input.nickname;
        app.globalData.gameProfile.islandName = this.data.input.islandName;
        this.setData({
          clientStatus: "ok",
          loading: {
            ...this.data.loading,
            isEnter: false,
          },
        });
      });
  },

  onTapBack: function () {
    this.setData({ clientStatus: "ok" });
    // wx.switchTab({
    //   url: "/pages/profile/profile",
    // });
  },

  bindNicknameInput: function (e) {
    this.setData({
      input: {
        ...this.data.input,
        nickname: e.detail.value,
      },
    });
    console.log("nickname: " + this.data.input.nickname);
  },

  bindIslandNameInput: function (e) {
    this.setData({
      input: {
        ...this.data.input,
        islandName: e.detail.value,
      },
    });
    console.log("islandName: " + this.data.input.islandName);
  },

  // --- Mask ---
  onTapHideCurtain: function () {
    if (this.data.curtain.filter === true) {
      this.onTapFilterExec();
    } else {
      this.setData({
        curtain: {
          ...this.data.curtain,
          filter: false,
          search: false,
        },
      });
    }
  },

  // --- general db data fetch ---
  fetchData: (condition, dbSkip) => {
    if (typeof condition === "string") {
      return db
        .collection("Nookea-items")
        .where({
          zh_name: db.RegExp({ regexp: condition }),
        })
        .skip(dbSkip)
        .limit(18)
        .get();
    } else {
      return db
        .collection("Nookea-items")
        .where(condition)
        .skip(dbSkip)
        .limit(18)
        .get();
    }
  },
});

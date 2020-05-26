// pages/nookeaGoods/nookeaGoods.js
const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");
// gif
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;

Page({
  data: {
    productInfo: null,
    rooms: [],
    selfPost: {
      room_id: null,
      roomInfo: null,
    },
    content: {
      bell: "",
      ticket: "",
      wishlist: false,
      isWxid: false,
      wxidText: "",
      notes: "你报个价吧~",
    },
    offset: 0,
    modal: {
      openPost: false,
      isKeyboard: false,
    },
    loading: {
      isRefresh: false,
      isBottom: false,
    },
    img: {
      BellIcon: iu.nookeaRooms.bell,
      TicketIcon: iu.nookeaRooms.ticket,
      WishlistIcon: iu.nookeaRooms.wishlist,
      NoteIcon: iu.nookeaRooms.note,
      WxIcon: iu.nookeaRooms.wx,
      BellIconGray: iu.nookeaRooms.bellGray,
      TicketIconGray: iu.nookeaRooms.ticketGray,
      WishlistIconGray: iu.nookeaRooms.wishlistGray,
      NoteIconGray: iu.nookeaRooms.noteGray,
      WxIconGray: iu.nookeaRooms.wxGray,
      modalBG: iu.nookeaRooms.modalBG,
      modalBG2: iu.nookeaRooms.modalBG2,
    },
    gif: {
      EarthLoadingUrl: null,
    },
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
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
    });
    // let product_id = options._id;
    let product_id = "05f2c36f5ebd2e7200d107826abdcfc1";
    // let product_id = 'E75KUkDxPwSdFYDhCx4MyNy7mcN5mqrzJ6Cj8MdfTYUicv6N'; // animal
    // let product_id = 'u7TxYI1mo9T6GOzgcEmf9THpZyGhvD74spTE34dJyOZpEeg9'; // bell
    // let product_id = 'vbzmb7NqboxiHeUfCZ32d0PoMB7xalxcvd6xqstMajvbvfDX'; // leaf
    // let product_id = 'SqnFeqrIMFfNATBfjAteno7ouyONBhNKUwqWHQG1vTASJ733'; // recepi

    if (!app.globalData.openid) {
      db.collection("UsersProfile")
        .get()
        .then((res) => {
          if (res.data.length > 0) app.globalData.openid = res.data[0]._openid;
        });
    }

    if (
      app.globalData.gameProfile.tradeHistory &&
      app.globalData.gameProfile.wishlist
    ) {
      this.setData({
        content: {
          ...this.data.content,
          wxidText: app.globalData.gameProfile.wxid,
        },
      });

      let _tradeHistory = app.globalData.gameProfile.tradeHistory;
      if (_tradeHistory.selling.rooms.hasOwnProperty(product_id)) {
        this.setData({
          selfPost: {
            ...this.data.selfPost,
            room_id: _tradeHistory.selling.rooms[product_id]._id,
          },
        });
        db.collection("Nookea-rooms")
          .doc(_tradeHistory.selling.rooms[product_id]._id)
          .get()
          .then((res) =>
            this.setData({
              selfPost: {
                ...this.data.selfPost,
                roomInfo: res.data,
              },
              content: res.data.content,
            })
          );
      }
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = (res) => {
        if (res.userInfo) {
          this.setData({
            content: {
              ...this.data.content,
              wxidText: app.globalData.gameProfile.wxid,
            },
          });

          let _tradeHistory = app.globalData.gameProfile.tradeHistory;
          if (_tradeHistory.selling.rooms.hasOwnProperty(product_id)) {
            console.log(_tradeHistory.selling.rooms[product_id]._id);
            this.setData({
              selfPost: {
                ...this.data.selfPost,
                room_id: _tradeHistory.selling.rooms[product_id]._id,
              },
            });
            db.collection("Nookea-rooms")
              .doc(_tradeHistory.selling.rooms[product_id]._id)
              .get()
              .then((res) =>
                this.setData({
                  selfPost: {
                    ...this.data.selfPost,
                    roomInfo: res.data,
                  },
                  content: res.data.content,
                })
              );
          }
        }
      };
    }

    db.collection("Nookea-items")
      .doc(product_id)
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({ productInfo: res.data });
        return res.data._id;
      })
      .then((item_id) => {
        if (this.data.productInfo.hasOwnProperty("recipe")) {
          this.setData({
            img: {
              ...this.data.img,
              叶子: iu.materials.叶子,
            },
          });
          for (let name in this.data.productInfo.recipe) {
            console.log(name);
            if (iu.materials.hasOwnProperty(name)) {
              this.setData({
                img: {
                  ...this.data.img,
                  [name]: iu.materials[name],
                },
              });
            }
          }
        }

        db.collection("Nookea-rooms")
          .where({
            isActive: true,
            itemInfo: {
              _id: item_id,
            },
          })
          .skip(this.data.offset)
          .limit(10)
          .orderBy("timestamp", "desc")
          .get()
          .then((res) =>
            this.setData({
              rooms: res.data,
              offset: this.data.offset + res.data.length,
              loading: {
                ...this.data.loading,
                isRefresh: false,
              },
            })
          );
      });
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
          .where({
            isActive: true,
            itemInfo: {
              _id: this.data.productInfo._id,
            },
          })
          .skip(this.data.offset)
          .limit(10)
          .orderBy("timestamp", "desc")
          .get()
          .then((res) =>
            this.setData({
              rooms: res.data,
              offset: this.data.offset + res.data.length,
              loading: {
                ...this.data.loading,
                isRefresh: false,
              },
            })
          );
      },
    });
  },

  onReachBottom: function () {
    this.setData({
      loading: {
        ...this.data.loading,
        isBottom: true,
      },
    });

    db.collection("Nookea-rooms")
      .where({
        isActive: true,
        itemInfo: {
          _id: this.data.productInfo._id,
        },
      })
      .skip(this.data.offset)
      .limit(10)
      .orderBy("timestamp", "desc")
      .get()
      .then((res) =>
        this.setData({
          rooms: this.data.rooms.concat(res.data),
          offset: this.data.offset + res.data.length,
          loading: {
            ...this.data.loading,
            isBottom: false,
          },
        })
      );
  },

  onTapEnter: function(e) {
    let {id, ismaster} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/nookeaRooms/nookeaRooms?id=' + id + '&isMaster=' + ismaster,
    })
  },

  // --- Add data to db ---
  onTapPostModal: function () {
    this.setData({
      modal: {
        ...this.data.modal,
        openPost: true,
      },
    });
  },

  onTapCreate: function (e) {
    let _masterInfo = {
      _openid: app.globalData.openid,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      gender: app.globalData.userInfo.gender,
      nickname: app.globalData.gameProfile.nickname,
      islandName: app.globalData.gameProfile.islandName,
      wishlist: app.globalData.gameProfile.wishlist,
    };

    // db.collection("Nookea-rooms")
    //   .add({
    //     data: {
    //       itemInfo: this.data.productInfo,
    //       masterInfo: _masterInfo,
    //       comments: [],
    //       isActive: true,
    //       timestamp: util.formatTime(),
    //       content: this.data.content,
    //     }
    //   })
  },

  // --- Modal Control ---
  hideModal: function () {
    if (this.data.modal.isKeyboard) {
      wx.hideKeyboard().then(() => {
        this.setData({
          modal: {
            ...this.data.modal,
            isKeyboard: false,
          },
        });
      });
    } else {
      this.setData({
        modal: {
          ...this.data.modal,
          openPost: false,
        },
      });
    }
  },

  bindModalStr: function (e) {
    let title = e.currentTarget.dataset.title;
    this.setData({
      content: {
        ...this.data.content,
        [title]: e.detail.value,
      },
    });
  },

  bindModalSwitch: function (e) {
    let title = e.currentTarget.dataset.title;
    this.setData({
      content: {
        ...this.data.content,
        [title]: !this.data.content[title],
      },
    });
  },

  bindInputFocus: function () {
    this.setData({
      modal: {
        ...this.data.modal,
        isKeyboard: true,
      },
    });
  },

  onTapCreate: function () {},
});

// pages/nookeaRooms/nookeaRooms.js

const app = getApp();
const db = wx.cloud.database();
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;
const util = require("../../utils/util");
const _ = db.command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: {
      isRefresh: false,
      isBottom: false,
    },
    gif: {
      EarthLoadingUrl: null,
    },
    currentRoom: "",
    db: {},
    showModal: false,
    addReplyEnabled: true,
    img: {
      BellIcon: iu.nookeaRooms.bell,
      TicketIcon: iu.nookeaRooms.ticket,
      WishlistIcon: iu.nookeaRooms.wishlist,
      BellIconGray: iu.nookeaRooms.bellGray,
      TicketIconGray: iu.nookeaRooms.ticketGray,
      WishlistIconGray: iu.nookeaRooms.wishlistGray,
    },
    // commentSelect控制留言和心愿单切换
    commentSelect: true,
    firstTimeLoad: true,
    isExpand: [],
    isMaster: true,
    // paymentType用于控制留言选项中 玲钱，机票，心愿单的开关
    paymentType: {
      bell: false,
      ticket: false,
      wishlist: false,
    },
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
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
      nowTimestamp: util.formatTime(),
      isMaster: options.isMaster === "true" ? true : false,
      currentRoom: options.id,
    });
    const getUserInfo = new Promise((resolve, reject) => {
      if (app.globalData.userInfo) {
        this.setData({
          openid: app.globalData.openid,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          islandName: app.globalData.gameProfile.islandName,
          nickname: app.globalData.gameProfile.nickname,
        });
        resolve();
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = (res) => {
          // onLaunch -> onLoad -> onLaunch: has to get data here
          if (res.userInfo) {
            this.setData({
              openid: app.globalData.openid,
              avatarUrl: app.globalData.userInfo.avatarUrl,
              islandName: app.globalData.gameProfile.islandName,
              nickname: app.globalData.gameProfile.nickname,
            });
          }
          resolve();
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
            resolve();
          },
        });
        resolve(
          db
            .collection("UsersProfile")
            .get()
            .then((res) => {
              if (res.data.length > 0) {
                app.globalData.openid = res.data[0]._openid;
                app.globalData.gameProfile.islandName = res.data[0].islandName;
                app.globalData.gameProfile.nickname = res.data[0].nickname;
                this.setData({
                  openid: app.globalData.openid,
                  avatarUrl: app.globalData.userInfo.avatarUrl,
                  islandName: app.globalData.gameProfile.islandName,
                  nickname: app.globalData.gameProfile.nickname,
                });
              }
            })
        );
      }
    });

    getUserInfo
      .then(() =>
        db.collection("Nookea-rooms").doc(this.data.currentRoom).get()
      )
      .then((res) => {
        let dbdata = res.data;
        let len = dbdata.comments.length;
        dbdata.comments = dbdata.comments.map((t, i) => {
          t.conversations.sort((a, b) => a.timestamp - b.timestamp);
          t.noteIndex = i;
          t.lastConversationTimestamp =
            t.conversations[t.conversations.length - 1].timestamp;
          if (
            t.slaveInfo._openid !== this.data.openid &&
            dbdata.masterInfo._openid !== this.data.openid
          ) {
            t.conversations = [t.conversations[0]];
          }
          return t;
        });
        if (dbdata.masterInfo._openid == this.data.openid) {
          this.setData({
            addReplyEnabled: false,
            isExpand: Array(len).fill(false),
          });
          dbdata.comments.sort((a, b) => {
            if (a.isUpdated && !b.isUpdated) {
              return -1;
            } else if (!a.isUpdated && b.isUpdated) {
              return 1;
            } else {
              return a.lastConversationTimestamp < b.lastConversationTimestamp
                ? 1
                : -1;
            }
          });
        } else {
          for (let i in dbdata.comments) {
            if (dbdata.comments[i].slaveInfo._openid === this.data.openid) {
              const temp = dbdata.comments[i];
              dbdata.comments[i] = dbdata.comments[0];
              dbdata.comments[0] = temp;
              let isExpand = Array(len).fill(false);
              isExpand[0] = true;
              this.setData({
                addReplyEnabled: false,
                isExpand: isExpand,
              });
              break;
            }
          }
        }
        console.log(this.data.isMaster);
        this.setData({
          db: dbdata,
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
        console.log(this.data.db);
      });
    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .watch({
        onChange: (snapshot) => {
          let dbdata = snapshot.docs[0];
          let len = dbdata.comments.length;
          dbdata.comments = dbdata.comments.map((t, i) => {
            t.conversations.sort((a, b) => a.timestamp - b.timestamp);
            t.noteIndex = i;
            t.lastConversationTimestamp =
              t.conversations[t.conversations.length - 1].timestamp;
            if (
              t.slaveInfo._openid !== this.data.openid &&
              dbdata.masterInfo._openid !== this.data.openid
            ) {
              t.conversations = [t.conversations[0]];
            }
            return t;
          });
          if (dbdata.masterInfo._openid == this.data.openid) {
            if (len !== this.data.isExpand.length) {
              this.setData({
                isExpand: Array(len).fill(false),
              });
            }
            this.setData({
              addReplyEnabled: false,
            });
            dbdata.comments.sort((a, b) => {
              if (a.isUpdated && !b.isUpdated) {
                return -1;
              } else if (!a.isUpdated && b.isUpdated) {
                return 1;
              } else {
                return a.lastConversationTimestamp < b.lastConversationTimestamp
                  ? 1
                  : -1;
              }
            });
          } else {
            for (let i in dbdata.comments) {
              if (dbdata.comments[i].slaveInfo._openid === this.data.openid) {
                const temp = dbdata.comments[i];
                dbdata.comments[i] = dbdata.comments[0];
                dbdata.comments[0] = temp;
                if (len !== this.data.isExpand.length) {
                  this.setData({
                    isExpand: Array(len).fill(false),
                  });
                }
                this.setData({
                  addReplyEnabled: false,
                });
                break;
              }
            }
          }
          this.setData({
            db: dbdata,
            loading: {
              ...this.data.loading,
              isRefresh: false,
            },
          });
          console.log(this.data.db);
        },
        onError: (err) => {
          console.error(err);
        },
      });
    //每隔10s刷新一次时间
    setInterval(() => {
      console.log("获取时间中...");
      this.setData({
        nowTimestamp: util.formatTime(),
      });
    }, 60000);
  },

  modalShow: function (e) {
    this.setData({
      showModal: true,
    });
  },

  modalHide: function () {
    this.setData({
      showModal: false,
      replyText: "",
    });
  },

  replyText: function (e) {
    this.setData({
      replyText: e.detail.value,
    });
  },

  onTapClose: function () {
    this.setData({
      loading: {
        ...this.data.loading,
        isRefresh: true,
      },
    });
    let _timestamp = util.formatTime();
    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .update({
        data: {
          comments: db.command.push({
            paymentType: this.data.paymentType,
            slaveInfo: {
              _openid: this.data.openid,
              avatarUrl: this.data.avatarUrl,
              islandName: this.data.islandName,
              nickname: this.data.nickname,
            },
            conversations: [
              {
                isMaster: false,
                timestamp: _timestamp,
                content: this.data.replyText,
              },
            ],
          }),
        },
      })
      .then((t) => {
        // 更新对方的tradeHistory 这个仅可能slave发送
        let reciverId = this.data.db.masterInfo._openid;
        wx.cloud.callFunction({
          name: "conversationNotify",
          data: {
            isMaster: this.data.isMaster,
            senderName: app.globalData.gameProfile.nickname,
            reciverId: reciverId,
            infomation: this.data.replyText,
            productid: this.data.db.itemInfo._id,
            img_url: this.data.db.itemInfo.img_url,
            roomId: this.data.currentRoom,
            timestamp: _timestamp,
            zh_name: this.data.db.itemInfo.zh_name,
          },
        });
        console.log(t);
        return this.setData({
          showModal: false,
          addReplyEnabled: false,
          replyText: "",
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      })
      .catch((t) => console.log(t));
  },
  onTapSend: function (e) {
    this.setData({
      loading: {
        ...this.data.loading,
        isRefresh: true,
      },
    });
    let _timestamp = util.formatTime();
    const updateDef = {};
    updateDef[
      `comments.${e.currentTarget.dataset.index}.conversations`
    ] = db.command.push({
      isMaster: this.data.openid === this.data.db.masterInfo._openid,
      timestamp: _timestamp,
      content: this.data.replyText,
    });

    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .update({
        data: updateDef,
      })
      .then((t) => {
        // 更新对方的tradeHistory
        let index = e.currentTarget.dataset.localindex;
        let reciverId = this.data.isMaster
          ? this.data.db.comments[index].slaveInfo._openid
          : this.data.db.masterInfo._openid;
        console.log(index);
        console.log(this.data.db.comments);
        wx.cloud.callFunction({
          name: "conversationNotify",
          data: {
            isMaster: this.data.isMaster,
            senderName: app.globalData.gameProfile.nickname,
            reciverId: reciverId,
            infomation: this.data.replyText,
            productid: this.data.db.itemInfo._id,
            img_url: this.data.db.itemInfo.img_url,
            roomId: this.data.currentRoom,
            timestamp: _timestamp,
            zh_name: this.data.db.itemInfo.zh_name,
          },
        });
        // call function end
        return this.setData({
          replyText: "",
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      })
      .catch((t) => console.log(t));
  },

  commentClick: function () {
    if (!this.data.commentSelect) {
      if (this.data.firstTimeLoad) {
        this.setData({
          firstTimeLoad: false,
        });
      }
      this.setData({
        commentSelect: true,
      });
    }
  },

  wishlistClick: function () {
    if (this.data.commentSelect) {
      if (this.data.firstTimeLoad) {
        this.setData({
          firstTimeLoad: false,
        });
      }
      this.setData({
        commentSelect: false,
      });
    }
  },

  paymentTypeCheck: function (e) {
    let _name = e.currentTarget.dataset.name;
    this.setData({
      paymentType: {
        ...this.data.paymentType,
        [_name]: !this.data.paymentType[_name],
      },
    });
  },

  expandClick: function (e) {
    // toggle idx的expand，关闭其他idx的expand
    let idx = e.currentTarget.dataset.index;
    let _isExpand = Array(this.data.isExpand.length).fill(false);
    _isExpand[idx] = !this.data.isExpand[idx];
    this.setData({
      isExpand: _isExpand,
    });
  },
  // 用于切换房间开关状态
  closeRoomClick: function () {
    let isActive = this.data.db.isActive;
    let path = "db.isActive";
    let _timestamp = util.formatTime();
    this.setData({
      [path]: !isActive,
    });
    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .update({
        data: {
          isActive: !isActive,
        },
      });
    // history.selling -> history
    if (isActive) {
      db.collection("Nookea-rooms")
        .doc(this.data.currentRoom)
        .get()
        .then((res) => {
          let productId = res.data.itemInfo._id;
          let tradeHistory = app.globalData.gameProfile.tradeHistory;
          if (typeof tradeHistory.history.rooms === "undefined") {
            tradeHistory.history["rooms"] = {};
          }
          tradeHistory.history.rooms[productId] =
            tradeHistory.selling.rooms[productId];
          delete tradeHistory.selling.rooms[productId];
          app.globalData.gameProfile.tradeHistory = tradeHistory;
          db.collection("UsersProfile")
            .doc(app.globalData.id)
            .update({
              data: {
                tradeHistory: _.set(tradeHistory),
              },
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // 以上是move history里的
      db.collection("Nookea-rooms")
        .doc(this.data.currentRoom)
        .get()
        .then((res) => {
          let productId = res.data.itemInfo._id;
          let tradeHistory = app.globalData.gameProfile.tradeHistory;
          if (typeof tradeHistory.history.rooms === "undefined") {
            tradeHistory.selling["rooms"] = {};
          }
          tradeHistory.selling.rooms[productId] =
            tradeHistory.history.rooms[productId];
          delete tradeHistory.history.rooms[productId];
          app.globalData.gameProfile.tradeHistory = tradeHistory;
          db.collection("UsersProfile")
            .doc(app.globalData.id)
            .update({
              data: {
                tradeHistory: _.set(tradeHistory),
              },
            });
          // 以下是update nookea-rooms.timestamp
          db.collection("Nookea-rooms")
            .doc(this.data.currentRoom)
            .update({
              data: {
                timestamp: _timestamp,
              },
            });
        })
        .catch((err) => {
          console.log(err);
        });
      // <----------------------- cloud func call -------------------------->
      wx.cloud.callFunction({
        name: "newSellingNotify",
        data: {
          zh_name: this.data.db.itemInfo.zh_name,
          img_url: this.data.db.itemInfo.img_url,
          roomId: this.data.db.itemInfo._id, //This roomId is actuall productId
          timestamp: _timestamp,
        },
      });
    }
  },
  settingClick: function () {
    //TODO
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});

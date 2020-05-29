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
    currentRoom: "",
    db: {},
    modal: {
      reply: false,
      update: false,
      content: {},
      replyText: "",
      isKeyboard: false,
    },
    addReplyEnabled: true,
    // commentSelect控制留言和心愿单切换
    commentSelect: true,
    firstTimeLoad: true,
    // chattingId用于追踪打开的对话框
    chattingId: null,
    isMaster: true,
    // paymentType用于控制留言选项中 玲钱，机票，心愿单的开关
    paymentType: {
      bell: false,
      ticket: false,
      wishlist: false,
    },
    setInter: null,
    watcher: null,
    loading: {
      isUpdate: false,
      isComment: false,
    },
    gif: {
      FlightLoading: iu.gif.FlightLoading,
      IslandLoading: iu.gif.IslandLoading,
    },
    img: {
      BellIcon: iu.nookea.bell,
      TicketIcon: iu.nookea.ticket,
      WishlistIcon: iu.nookea.wishlist,
      NoteIcon: iu.nookea.note,
      WxIcon: iu.nookea.wx,
      BellIconGray: iu.nookea.bellGray,
      TicketIconGray: iu.nookea.ticketGray,
      WishlistIconGray: iu.nookea.wishlistGray,
      NoteIconGray: iu.nookea.noteGray,
      WxIconGray: iu.nookea.wxGray,
      modalBG_ballon: iu.nookea.modalBG_ballon,
      modalBG: iu.nookea.modalBG,
      modalBG2: iu.nookea.modalBG2,
    },
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },

  // onLoad: function (options) {
  onLoad: function () {
    let options = {
      id: "982133855ec0a22f00dc2b0703e78dc7",
      isMaster: "false",
    }
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
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
          });
          dbdata.comments.sort((a, b) => {
            if (this.data.isMaster && a.isMasterUpdated && !b.isMasterUpdated) {
              return -1;
            } else if (
              this.data.isMaster &&
              !a.isMasterUpdated &&
              b.isMasterUpdated
            ) {
              return 1;
            } else if (
              !this.data.isMaster &&
              a.isSlaveUpdated &&
              !b.isSlaveUpdated
            ) {
              return -1;
            } else if (
              !this.data.isMaster &&
              !a.isSlaveUpdated &&
              b.isSlaveUpdated
            ) {
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
              this.setData({
                addReplyEnabled: false,
              });
              break;
            }
          }
        }
        this.setData({
          db: dbdata,
          modal: {
            ...this.data.modal,
            content: dbdata.content,
          },
        });
      });
    this.data.watcher = db
      .collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .watch({
        onChange: (snapshot) => {
          let dbdata = snapshot.docs[0];
          if (!this.data.chattingId) {
            // 没有打开对话的时候，watch 整个dbdata并按时间排序
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
          } else {
            // 有打开对话的时候， watch 当前的对话(仅comments.conversations)
            dbdata = this.data.db;
            let changeField = snapshot.docChanges[0].updatedFields;
            let { nodeIndex, index } = this.findNoteIndex(dbdata);
            if (typeof changeField !== "undefined") {
              for (var x in changeField) {
                if (x.includes(`comments.${nodeIndex}.`)) {
                  dbdata.comments[index].conversations.push(changeField[x]);
                }
              }
            }
            console.log(dbdata);
          }
          if (dbdata.masterInfo._openid == this.data.openid) {
            // 是Master的情况，这时候需要考虑排序
            this.setData({
              addReplyEnabled: false,
            });
            if (!this.data.chattingId) {
              // chattingID没有的时候进行排序
              dbdata.comments.sort((a, b) => {
                if (a.isMasterUpdated && !b.isMasterUpdated) {
                  return -1;
                } else if (!a.isMasterUpdated && b.isMasterUpdated) {
                  return 1;
                } else {
                  return a.lastConversationTimestamp <
                    b.lastConversationTimestamp
                    ? 1
                    : -1;
                }
              });
            }
          } else {
            // 是Slave的情况
            for (let i in dbdata.comments) {
              if (dbdata.comments[i].slaveInfo._openid === this.data.openid) {
                const temp = dbdata.comments[i];
                dbdata.comments[i] = dbdata.comments[0];
                dbdata.comments[0] = temp;
                this.setData({
                  addReplyEnabled: false,
                });
                break;
              }
            }
          }
          this.setData({
            db: dbdata,
            modal: {
              ...this.data.modal,
              content: dbdata.content,
            },
          });
        },
        onError: (err) => {
          console.error(err);
        },
      });

    clearInterval(this.data.setInter);
    //每隔60s刷新一次时间
    this.data.setInter = setInterval(() => {
      console.log("获取时间中...");
      this.setData({
        nowTimestamp: util.formatTime(),
      });
    }, 60000);
  },

  onTapSend: function (e) {
    let _timestamp = util.formatTime();
    const updateDef = {};
    updateDef[
      `comments.${e.currentTarget.dataset.index}.conversations`
    ] = db.command.push({
      isMaster: this.data.openid === this.data.db.masterInfo._openid,
      timestamp: _timestamp,
      content: this.data.modal.replyText,
    });
    // Slave send to Master -> comments.isMasterUpdated: ture
    //                       & comments.isSlaveUpdated: false
    // Master send to slave -> commetns.isSlaveUpdated: ture
    //                       & comments.isMasterUpdated: false
    let path1 = `comments.${e.currentTarget.dataset.index}.isMasterUpdated`;
    let path2 = `comments.${e.currentTarget.dataset.index}.isSlaveUpdated`;
    if (!this.data.isMaster) {
      updateDef[path1] = true;
      updateDef[path2] = false;
    } else {
      updateDef[path1] = false;
      updateDef[path2] = true;
    }

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
        wx.cloud.callFunction({
          name: "conversationNotify",
          data: {
            isMaster: this.data.isMaster,
            senderName: app.globalData.gameProfile.nickname,
            reciverId: reciverId,
            infomation: this.data.modal.replyText,
            productid: this.data.db.itemInfo._id,
            img_url: this.data.db.itemInfo.img_url,
            roomId: this.data.currentRoom,
            timestamp: _timestamp,
            zh_name: this.data.db.itemInfo.zh_name,
          },
        });
        // call function end
        return this.setData({
          modal: {
            ...this.data.modal,
            replyText: "",
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
    let localindex = e.currentTarget.dataset.localindex;
    let dbindex = e.currentTarget.dataset.index;
    // chattingId: null,
    // console.log(idx);
    // console.log(this.data.db);
    let isUpdated = this.data.isMaster ? "isMasterUpdated" : "isSlaveUpdated";
    let isUpdatePath = "db.comments[" + localindex + "]." + isUpdated;

    if (
      this.data.db.comments[localindex].slaveInfo._openid !==
      this.data.chattingId
    ) {
      let id = this.data.db.comments[localindex].slaveInfo._openid;
      this.setData({
        chattingId: id,
        [isUpdatePath]: false,
      });
    } else {
      this.setData({
        chattingId: null,
      });
      // update comments.isUpdated
      let path = "comments." + dbindex + "." + isUpdated;
      db.collection("Nookea-rooms")
        .doc(this.data.currentRoom)
        .update({
          data: {
            [path]: false,
          },
        })
        .then((res) => {
          //这里应该重新fatch db
          this.refetch();
        })
        .catch((res) => {
          console.log(res);
        });
    }
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

  modalShow: function (e) {
    this.setData({
      modal: {
        ...this.data.modal,
        reply: true,
      },
    });
  },

  modalHide: function () {
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
          reply: false,
          update: false,
        },
      });
    }
  },

  bindModalStr: function (e) {
    let title = e.currentTarget.dataset.title;
    if (title === "replyText") {
      this.setData({
        modal: {
          ...this.data.modal,
          [title]: e.detail.value,
          isKeyboard: false,
        },
      });
    } else {
      this.setData({
        modal: {
          ...this.data.modal,
          content: {
            ...this.data.modal.content,
            [title]: e.detail.value,
          },
          isKeyboard: false,
        },
      });
    }
    console.log(this.data.modal);
  },

  bindModalSwitch: function (e) {
    let title = e.currentTarget.dataset.title;

    this.setData({
      modal: {
        ...this.data.modal,
        content: {
          ...this.data.modal.content,
          [title]: !this.data.modal.content[title],
        },
      },
    });
  },

  onTapComment: function () {
    this.setData({
      loading: {
        ...this.data.loading,
        isComment: true,
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
                content: this.data.modal.replyText,
              },
            ],
            isMasterUpdated: true,
            isSlaveUpdated: false,
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
            infomation: this.data.modal.replyText,
            productid: this.data.db.itemInfo._id,
            img_url: this.data.db.itemInfo.img_url,
            roomId: this.data.currentRoom,
            timestamp: _timestamp,
            zh_name: this.data.db.itemInfo.zh_name,
          },
        });
        //然后 更新自己的tradeaHistory,加入到自己的留言里
        let path = "tradeHistory.buying.rooms." + this.data.db.itemInfo._id;
        db.collection("UsersProfile")
          .where({
            _openid: app.globalData.openid,
          })
          .update({
            data: {
              [path]: {
                description: "你发布了留言",
                img_url: this.data.db.itemInfo.img_url,
                isUpdated: false,
                roomId: this.data.currentRoom,
                timestamp: _timestamp,
                zh_name: this.data.db.itemInfo.zh_name,
              },
            },
          });

        console.log(t);
        return this.setData({
          addReplyEnabled: false,
          modal: {
            ...this.data.modal,
            replyText: "",
            reply: false,
            isKeyboard: false
          },
          loading: {
            ...this.data.loading,
            isComment: false,
          },
        });
      })
      .catch((t) => console.log(t));
  },

  showModalSetting: function () {
    this.setData({
      modal: {
        ...this.data.modal,
        update: true,
      },
    });
  },

  onTapUpdate: function () {
    this.setData({
      loading: {
        ...this.data.loading,
        isUpdate: true,
      },
    })

    let _masterInfo = {
      _openid: app.globalData.openid,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      gender: app.globalData.userInfo.gender,
      nickname: app.globalData.gameProfile.nickname,
      islandName: app.globalData.gameProfile.islandName,
      wishlist: app.globalData.gameProfile.wishlist,
    };

    let _timestamp = util.formatTime();

    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .update({
        data: {
          content: this.data.modal.content,
          masterInfo: _masterInfo,
          timestamp: _timestamp,
        },
      })
      .then(() => {
        this.setData({
          modal: {
            ...this.data.modal,
            update: false,
          },
          loading: {
            ...this.data.loading,
            isUpdate: false,
          },
        });
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

  findNoteIndex: function (dbdata) {
    for (var x in dbdata.comments) {
      if (this.data.chattingId === dbdata.comments[x].slaveInfo._openid) {
        return { nodeIndex: dbdata.comments[x].noteIndex, index: x };
      }
    }
    console.log("Error on findNoteIndex");
    return -1;
  },

  //用于重新fetch db
  refetch: function () {
    db.collection("Nookea-rooms")
      .doc(this.data.currentRoom)
      .get()
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
          });
          dbdata.comments.sort((a, b) => {
            if (this.data.isMaster && a.isMasterUpdated && !b.isMasterUpdated) {
              return -1;
            } else if (
              this.data.isMaster &&
              !a.isMasterUpdated &&
              b.isMasterUpdated
            ) {
              return 1;
            } else if (
              !this.data.isMaster &&
              a.isSlaveUpdated &&
              !b.isSlaveUpdated
            ) {
              return -1;
            } else if (
              !this.data.isMaster &&
              !a.isSlaveUpdated &&
              b.isSlaveUpdated
            ) {
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
              this.setData({
                addReplyEnabled: false,
              });
              break;
            }
          }
        }
        this.setData({
          db: dbdata,
          modal: {
            ...this.data.modal,
            content: dbdata.content,
          },
          loading: {
            ...this.data.loading,
            isRefresh: false,
          },
        });
      });
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
  onUnload: function () {
    clearInterval(this.data.setInter);
    this.data.watcher.close();
  },

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

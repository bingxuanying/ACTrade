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
      isBottom: false,
    },
    gif: {
      EarthLoadingUrl: null,
    },
    currentRoom: "982133855ec0a22f00dc2b0703e78dc7",
    db: {},
    showModal: false,
    addReplyEnabled: true,
    img: {
      BellIcon: iu.nookeaRooms.bell,
      TicketIcon: iu.nookeaRooms.ticket,
      WishlistIcon: iu.nookeaRooms.wishlist,
    },
    commentSelect: true,
    firstTimeLoad: true,
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
        openid: app.globalData.gameProfile._openid,
        avatarUrl: app.globalData.gameProfile.avatarUrl,
        islandName: app.globalData.gameProfile.islandName,
        nickName: app.globalData.gameProfile.nickName,
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        // onLaunch -> onLoad -> onLaunch: has to get data here
        if (res.userInfo) {
          this.setData({
            openid: app.globalData.gameProfile._openid,
            avatarUrl: app.globalData.gameProfile.avatarUrl,
            islandName: app.globalData.gameProfile.islandName,
            nickName: app.globalData.gameProfile.nickName,
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
            app.globalData.gameProfile._openid = res.data[0]._openid;
            app.globalData.gameProfile.avatarUrl =
              res.data[0].userInfo.avatarUrl;
            app.globalData.gameProfile.islandName = res.data[0].islandName;
            app.globalData.gameProfile.nickName = res.data[0].nickname;
            this.setData({
              openid: app.globalData.gameProfile._openid,
              avatarUrl: app.globalData.gameProfile.avatarUrl,
              islandName: app.globalData.gameProfile.islandName,
              nickName: app.globalData.gameProfile.nickName,
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
      .then((res) => {
        let dbdata = res.data;
        dbdata.notes = dbdata.notes.map((t, i) => {
          t.conversations.sort((a, b) => a.timestamp - b.timestamp);
          t.noteIndex = i;
          if (
            t.slaveInfo._openid !== this.data.openid &&
            dbdata.masterInfo._openid !== this.data.openid
          ) {
            t.conversations = [t.conversations[0]];
          }
          return t;
        });
        for (let i in dbdata.notes) {
          if (dbdata.notes[i].slaveInfo._openid === this.data.openid) {
            const temp = dbdata.notes[i];
            dbdata.notes[i] = dbdata.notes[0];
            dbdata.notes[0] = temp;
            this.setData({
              addReplyEnabled: false,
            });
            break;
          }
        }
        this.setData({
          db: dbdata,
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
          let dbdata = snapshot.docs[0];
          dbdata.notes = dbdata.notes.map((t, i) => {
            t.conversations.sort((a, b) => a.timestamp - b.timestamp);
            t.noteIndex = i;
            if (
              t.slaveInfo._openid !== this.data.openid &&
              dbdata.masterInfo._openid !== this.data.openid
            ) {
              t.conversations = [t.conversations[0]];
            }
            return t;
          });
          for (let i in dbdata.notes) {
            if (dbdata.notes[i].slaveInfo._openid === this.data.openid) {
              const temp = dbdata.notes[i];
              dbdata.notes[i] = dbdata.notes[0];
              dbdata.notes[0] = temp;
              this.setData({
                addReplyEnabled: false,
              });
              break;
            }
          }
          //监控数据发生变化时触发
          this.setData({
            db: dbdata,
          });
        },
        onError: (err) => {
          console.error(err);
        },
      });
  },

  modalShow: function (e) {
    this.setData({
      showModal: true,
      noteIndex: e.currentTarget.dataset.index,
    });
    console.log(this.data.noteIndex);
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
    if (this.data.noteIndex === undefined) {
      db.collection("Nookea-rooms")
        .doc(this.data.currentRoom)
        .update({
          data: {
            notes: db.command.push({
              slaveInfo: {
                _openid: this.data.openid,
                avatarUrl: this.data.avatarUrl,
                islandName: this.data.islandName,
                nickName: this.data.nickName,
              },
              conversations: [
                {
                  isMaster: false,
                  timestamp: util.formatTime(),
                  content: this.data.replyText,
                },
              ],
            }),
          },
        })
        .then((t) => {
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
    } else {
      const updateDef = {};
      updateDef[`notes.${this.data.noteIndex}.conversations`] = db.command.push(
        {
          isMaster: this.data.openid === this.data.db.masterInfo._openid,
          timestamp: util.formatTime(),
          content: this.data.replyText,
        }
      );

      db.collection("Nookea-rooms")
        .doc(this.data.currentRoom)
        .update({
          data: updateDef,
        })
        .then((t) => {
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
    }
  },
  commentClick: function () {
    console.log("comment click");
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
    console.log(this.data.commentSelect);
    console.log(this.data.firstTimeLoad);
  },
  wishlistClick: function () {
    console.log("wishlist click");
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
    console.log(this.data.commentSelect);
    console.log(this.data.firstTimeLoad);
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

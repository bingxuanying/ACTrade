// pages/tradingFloor/tradingFloor.js
const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");

Page({
  data: {
    curTool_id: "",
    preTool_id: "",
    isLoading: false,
    isBottomLoading: false,
    offset: 0,
    order: "createTime",
    showModal: false,
    keyword: "",
    cards: [],
  },
  onLoad: function () {
    var app = getApp();
    this.setData({
      isLoading: true,
    });
    db.collection("Flights")
      .where({
        flight: "Business",
        status: "online",
      })
      .orderBy(this.data.order, "desc")
      .skip(this.data.offset)
      .limit(10)
      .get({
        success: (res) => {
          console.log(res.data);
          this.setData({
            cards: res.data,
            // cards: [],
            isLoading: false,
            offset: this.data.offset + 10,
          });
        },
      });
    /***************** CallBack function Template Here ******************** */
    var that = this;
    app.UrlCallBack(
      function (res) {
        that.setData({
          EarthLoadingUrl: res.EarthLoadingUrl,
        });
      },
      "img",
      "EarthLoadingUrl"
    );
    /*************************************************** */
  },
  onPullDownRefresh: function () {
    this.setData({
      isLoading: true,
      curTool_id: "",
      preTool_id: "",
    });
    wx.stopPullDownRefresh({
      complete: (res) => {
        if (this.data.keyword.length === 5) {
          db.collection("Flights")
            .where({
              roomNum: this.data.keyword,
              status: "online",
            })
            .orderBy(this.data.order, "desc")
            .skip(0)
            .limit(10)
            .get({
              success: (res) => {
                this.setData({
                  cards: res.data,
                  offset: 10,
                  isLoading: false,
                });
              },
            });
        } else {
          db.collection("Flights")
            .where({
              flight: "Business",
              status: "online",
            })
            .orderBy(this.data.order, "desc")
            .skip(0)
            .limit(10)
            .get({
              success: (res) => {
                this.setData({
                  cards: res.data,
                  offset: 10,
                  isLoading: false,
                });
              },
            });
        }
      },
    });
  },
  onReachBottom: function () {
    this.setData({ isBottomLoading: true });

    if (this.data.keyword.length === 5) {
      db.collection("Flights")
        .where({
          roomNum: this.data.keyword,
          status: "online",
        })
        .orderBy(this.data.order, "desc")
        .skip(this.data.offset)
        .limit(10)
        .get({
          success: (res) => {
            this.setData({
              cards: this.data.cards.concat(res.data),
              offset: this.data.offset + 10,
              isBottomLoading: false,
            });
          },
        });
    } else {
      db.collection("Flights")
        .where({
          flight: "Business",
          status: "online",
        })
        .orderBy(this.data.order, "desc")
        .skip(this.data.offset)
        .limit(10)
        .get({
          success: (res) => {
            this.setData({
              cards: this.data.cards.concat(res.data),
              offset: this.data.offset + 10,
              isBottomLoading: false,
            });
          },
        });
    }
  },
  onTapCreate: function () {
    if (
      app.globalData.userInfo &&
      app.globalData.gameProfile.nickname.length > 0 &&
      app.globalData.gameProfile.islandName.length > 0
    ) {
      wx.navigateTo({
        url: "/pages/roomCreate/roomCreate",
        complete: (res) => {
          console.log(res);
        },
      });
    } else {
      wx.switchTab({
        url: "/pages/profile/profile",
      });
    }
  },
  onTapTime: function () {
    if (this.data.order === "price") {
      this.setData({
        order: "createTime",
        isLoading: true,
      });

      if (this.data.keyword.length === 5) {
        db.collection("Flights")
          .where({
            roomNum: this.data.keyword,
            status: "online",
          })
          .orderBy(this.data.order, "desc")
          .skip(0)
          .limit(10)
          .get({
            success: (res) => {
              this.setData({
                cards: res.data,
                offset: 10,
                isLoading: false,
              });
            },
          });
      } else {
        db.collection("Flights")
          .where({
            flight: "Business",
            status: "online",
          })
          .orderBy(this.data.order, "desc")
          .skip(0)
          .limit(10)
          .get({
            success: (res) => {
              this.setData({
                cards: res.data,
                offset: 10,
                isLoading: false,
              });
            },
          });
      }
    }
  },
  onTapPrice: function () {
    if (this.data.order === "createTime") {
      this.setData({
        order: "price",
        isLoading: true,
      });

      if (this.data.keyword.length === 5) {
        db.collection("Flights")
          .where({
            roomNum: this.data.keyword,
            status: "online",
          })
          .orderBy(this.data.order, "desc")
          .skip(0)
          .limit(10)
          .get({
            success: (res) => {
              this.setData({
                cards: res.data,
                offset: 10,
                isLoading: false,
              });
            },
          });
      } else {
        db.collection("Flights")
          .where({
            flight: "Business",
            status: "online",
          })
          .orderBy(this.data.order, "desc")
          .skip(0)
          .limit(10)
          .get({
            success: (res) => {
              this.setData({
                cards: res.data,
                offset: 10,
                isLoading: false,
              });
            },
          });
      }
    }
  },
  modalOpen: function (e) {
    this.setData({
      showModal: true,
    });
  },
  modalHide: function (e) {
    this.setData({
      showModal: false,
      keyword: "",
    });
  },
  bindSearchBar: function (e) {
    this.setData({
      keyword: e.detail.value.toUpperCase(),
    });
    console.log("keyword: " + this.data.keyword);
  },
  onTapSearch: function () {
    this.setData({
      showModal: false,
      isLoading: true,
    });

    db.collection("Flights")
      .where({
        roomNum: this.data.keyword,
        status: "online",
      })
      .orderBy(this.data.order, "desc")
      .skip(0)
      .limit(10)
      .get({
        success: (res) => {
          this.setData({
            cards: res.data,
            offset: 10,
            isLoading: false,
          });
        },
      });
  },
  onTapCancel: function () {
    this.setData({
      isLoading: true,
      keyword: "",
    });

    db.collection("Flights")
      .where({
        flight: "Business",
        status: "online",
      })
      .orderBy(this.data.order, "desc")
      .skip(0)
      .limit(10)
      .get({
        success: (res) => {
          this.setData({
            cards: res.data,
            offset: 10,
            isLoading: false,
          });
        },
      });
  },
  onTapCard: function (e) {
    this.setData({ preTool_id: this.data.curTool_id });
    if (e.currentTarget.id === this.data.curTool_id)
      this.setData({ curTool_id: "" });
    else this.setData({ curTool_id: e.currentTarget.id });
  },
  onTapJoin: function (e) {
    if (
      app.globalData.userInfo &&
      app.globalData.gameProfile.nickname.length > 0 &&
      app.globalData.gameProfile.islandName.length > 0
    ) {
      app.globalData.roomInfo = {
        roomID: e.currentTarget.id,
        timeStamp: util.formatTime(),
      };
      console.log(app.globalData.roomInfo);

      wx.navigateTo({
        url: "/pages/roomSlave/roomSlave",
      });
    } else {
      wx.switchTab({
        url: "/pages/profile/profile",
      });
    }
  },
  onShareAppMessage: function (e) {
    return {
      title: "来卖大头菜啦！！房间号是" + e.target.dataset.roomnum,
      path: "/pages/roomSlave/roomSlave?room_id=" + e.target.dataset.id,
      imageUrl: "../../assets/SharePage.png",
    };
  },
  // TabBar setting
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0, // 根据tab的索引值设置
      });
    }
  },

  // 推送测试
  // 获取formid
  getFormid(event) {
    console.log("获取到的formid", event.detail.formId);
    this.setData({
      formid: event.detail.formId,
    });
  },
  // 推送消息
  sendMsg() {
    let fromid = this.data.formid;
    wx.cloud.callFunction({
      name: "lineNotify",
      data: {
        formId: fromid,
      },
      success(res) {
        console.log("推送成功", res);
      },
      fail(res) {
        console.log("推送失败", res);
      },
    });
  },
});

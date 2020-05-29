const app = getApp();
const db = wx.cloud.database();
const json = require("../../utils/imgUrl");
const iu = json.default.imgUrl;
const util = require("../../utils/util");
const _ = db.command;

Component({
  properties: {
    text: {
      type: String,
      value: "Wechat",
    },
    back: {
      type: Boolean,
      value: false,
    },
    home: {
      type: Boolean,
      value: false,
    },
    navInfo: {
      type: String,
      value: "",
    },
    currentPage: {
      type: String,
      value: "",
    },
    roomId: {
      type: String,
      value: "",
    },
    userId: {
      type: String,
      value: "",
    },
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight + "px",
    navigationBarHeight: app.globalData.statusBarHeight + 44 + "px",
  },

  methods: {
    backHome: function () {
      let pages = getCurrentPages();
      wx.navigateBack({
        delta: pages.length,
      });
    },
    back: function (e) {
      if (this.data.currentPage === "nookeaRooms") {
        // 退出房间时清除自己的tradeHistory当前房间的isUpdated, 与tradeHistoryisUpdated.
        // 并且 清除nookea-rooms的自己的聊天的isUpdated(isSlaveUpdated/isMasterUpdated)
        db.collection("Nookea-rooms")
          .doc(this.data.roomId)
          .get()
          .then((res) => {
            let comments = res.data.comments;
            if (this.data.userId === res.data.masterInfo._openid) {
              for (var x in comments) {
                comments[x].isMasterUpdated = false;
              }
            } else {
              for (var x in comments) {
                if (comments[x].slaveInfo._openid === this.data.userId) {
                  comments[x].isSlaveUpdated = false;
                }
              }
            }
            wx.navigateBack({
              delta: 1,
            });
            console.log(comments);
            db.collection("Nookea-rooms")
              .doc(this.data.roomId)
              .update({
                data: {
                  comments: _.set(comments),
                },
              })
              .then(() => {
                console.log("update success");
              });
          })
          .catch((res) => {
            console.log(res);
          });
      } else {
        wx.navigateBack({
          delta: 1,
        });
      }
    },
  },
});

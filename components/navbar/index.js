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
      wx.switchTab({
        url: "/pages/tradingFloor/tradingFloor",
      });
    },
    back: function (e) {
      if (this.data.currentPage === "nookeaRooms") {
        // 清除nookea-rooms的自己的聊天的isUpdated(isSlaveUpdated/isMasterUpdated)
        wx.navigateBack({
          delta: 1,
        });
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

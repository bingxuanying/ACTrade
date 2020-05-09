// pages/diyExchange/diyExchange
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {},
  onLoad: function () {
    wx.cloud
      .getTempFileURL({
        fileList: [
          {
            fileID:
              "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/施工页面.jpg",
          },
        ],
      })
      .then((res) => {
        // get temp file URL
        console.log(res.fileList[0]);
        this.setData({
          constructPage: res.fileList[0].tempFileURL,
        });
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  },
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1, // 根据tab的索引值设置
      });
    }
  },
  onReady() {
    var that = this;
    setTimeout(function () {
      that.setData({
        isLoading: false,
      });
    }, 500);
  },
});

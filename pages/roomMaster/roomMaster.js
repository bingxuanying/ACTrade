// pages/roomMaster/roomMaster.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    MasterInfo: {
      avatar: null,
      islandName: '',
      masterName: '',
      fruit: null,
      hemisphere: null
    },
    Slaves: []
  },
  onLoad: function () {
    db.collection(app.globalData.roomInfo.type)
    .doc(app.globalData.roomInfo.roomID)
    .get({
      success: res => {
        var master = res.data.master
        console.log(master)
        this.setData({
          MasterInfo: {
            avatar:  master.userInfo.avatarUrl,
            islandName: master.gameProfile.islandName,
            masterName: master.gameProfile.nickname,
            fruit: master.gameProfile.fruit,
            hemisphere: master.gameProfile.fruit
          },
        })
        
      }
    })

    db.collection(app.globalData.roomInfo.type)
    .doc(app.globalData.roomInfo.roomID)
    .watch({
      onChange: (snapshot) => {
        //监控数据发生变化时触发
        this.setData({
          Slaves: snapshot.docs[0].slaves
        })
        console.log(this.data.Slaves)
      },
      onError:(err) => {
        console.error(err)
      }
    })
  },

})
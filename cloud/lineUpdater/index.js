const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log("触发lineUpdater");
  try {
    // 需要引入OPENID才能实现
    const flights = await db.collection('NotifyTest').get();
    flights.data.map(async flight => {
      var _slaves = flight.slaves;
      for (const idx in _slaves) {
        if (!_slaves[idx].notified && idx < flight.maxPeople) {
          _slaves[idx].notified = true;
          // 发送通知
          cloud.callFunction({
            name: 'lineNotify',
            data:{
              openid: "fakeopenid",
              roomNum:"fakeRoomNum",
            }
          });
        } 
      }
      await db.collection('NotifyTest').doc(flight._id).update({
        data: {
          slaves: _slaves
        }
      });
      return null;
    });
    return null;
  } catch (e) {
    console.log(e)
  }
  return null;
};


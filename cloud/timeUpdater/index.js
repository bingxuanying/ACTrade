const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  console.log("触发timeUpdater");
  try {
    var myDate = new Date();
    var mins = myDate.getMinutes();
    return await db.collection('TimeTest').add({
      data:{
        keya:"1",
        keyb:"2",
        TimeLeft:mins
      }
    })
  } catch (e) {
    console.log(e)
  }
};

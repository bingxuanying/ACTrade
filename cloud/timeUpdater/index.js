const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  console.log("触发timeUpdater");
  try {
    return await db.collection('Flights').where({
        TimeLeft: _.gt(0)
    }).update({
      data:{
        TimeLeft: _.inc(-1)
      }    
    })
  } catch (e) {
    console.log(e)
  }
};

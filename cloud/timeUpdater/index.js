const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  console.log("触发timeUpdater");
  try {
    return await db.collection('Flights').where({
        timeLeft: _.gt(0)
    }).update({
      data:{
        timeLeft: _.inc(-1)
      }
    }).then(function(res) {
      return db.collection('Flights').where({
        timeLeft: 0
      }).update({
        data: {
          status:"offline"
        }
      });
    })
  } catch (e) {
    console.log(e)
  }
};

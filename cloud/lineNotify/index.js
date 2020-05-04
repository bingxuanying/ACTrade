const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  var filedvalue1 = event.data1;
  var filedvalue2 = event.data2;
  try {
    return await db.collection("mydata").add({
      data: {
        filed1: filedvalue1,
        filed2: filedvalue2,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

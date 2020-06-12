const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log("触发lineUpdater");
  var flightNum = event.roomNum;
  var roomID = event.roomID;
  console.log(flightNum);
  console.log(roomID);
  try {
    const flights = await db.collection("Flights").where({_id:roomID}).get();
    const flight = flights.data[0];
    console.log(flight);
    var _slaves = flight.slaves;
    var note = cutText(flight.note)
    console.log(note)
    for (const idx in _slaves) {
      if (!_slaves[idx].notified && idx < flight.people) {
        _slaves[idx].notified = true;
        console.log(
          "now change notified for user" +
            idx +
            " in flihgt" +
            " " +
            flight.roomNum
        );
        // 发送通知
        cloud.callFunction({
          name: "lineNotify",
          data: {
            openid: _slaves[idx].openid,
            roomNum: flight.roomNum,
            password: flight.code,
            roomId: roomID,
            note : note
          },
          success: res => {
            console.log('sucsess')
          },
          fail: err => {
            console.log('err: ')
            console.log(err)
          },
          complete: res => {
            console.log('complete')
          }
        });
      } else {
        console.log("nofitied no change");
      }
    }
    await db
      .collection("Flights")
      .where({ roomNum: flightNum })
      .update({
        data: { slaves: _slaves },
      });
    return null;
  } catch (e) {
    console.log(e);
  }
  return null;
};

function cutText(text) {
  if(text == null){
    return "";
    }
    if(text.length > 17){
    return text.substring(0, numSub - 1) + "...";
    }
    return text;
}

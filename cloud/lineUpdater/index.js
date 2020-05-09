const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log("触发lineUpdater");
  var flightNum = event.roomNum;
  var roomID = event.roomID;
  console.log(typeof(roomID));
  try {
    const flights = await db.collection("Flights").where({_id:roomID}).get();
    const flight = flights.data[0];
    console.log(flight);
    var _slaves = flight.slaves;
    console.log(_slaves);
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
          },
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
    // flights.data.map(async (flight) => {
    //   var _slaves = flight.slaves;
    //   console.log(_slaves);
    //   for (const idx in _slaves) {
    //     if (!_slaves[idx].notified && idx < flight.people) {
    //       _slaves[idx].notified = true;
    //       console.log("now change notified for user"+idx+" in flihgt"+" "+ flight.roomNum);
    //       // 发送通知
    //       cloud.callFunction({
    //         name: "lineNotify",
    //         data: {
    //           openid: _slaves[idx].openid,
    //           roomNum: flight.roomNum,
    //           password: flight.code
    //         },
    //       });
    //     }
    //     else {
    //       console.log("nofitied no change");
    //     }
    //   }
    //   await db
    //     .collection("Flights")
    //     .doc(flight._id)
    //     .update({
    //       data: {
    //         slaves: _slaves,
    //       },
    //     });
    //   return null;
    // });
  } catch (e) {
    console.log(e);
  }
  return null;
};

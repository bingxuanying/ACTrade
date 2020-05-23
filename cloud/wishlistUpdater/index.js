const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let _wishlist = event.wishlist;
  let _tradeHistory = event.tradeHistory;
  console.log(_wishlist);
  console.log(_tradeHistory);
  console.log(OPENID);
  db.collection("UsersProfile")
    .where({
      _openid: OPENID,
    })
    .get()
    .then((res) => {
      let oldwishlist = res.data[0].wishlist;
      let { _newwishlist, _oldwishlist } = compare2Arr(oldwishlist, _wishlist);
      let deleteList = Object.keys(_oldwishlist);
      let addList = Object.keys(_newwishlist);

      db.collection("Nookea-items")
        .where({
          zh_name: _.in(addList),
        })
        .update({
          data: {
            subscription: _.inc(1),
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((res) => {
          console.log(res);
        });
      db.collection("Nookea-items")
        .where({
          zh_name: _.in(deleteList),
        })
        .update({
          data: {
            subscription: _.inc(-1),
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((res) => {
          console.log(res);
        });
    })
    .then(() => {
      // set wishlist
      db.collection("UsersProfile")
        .where({
          _openid: OPENID,
        })
        .update({
          data: {
            wishlist: _.set(_wishlist),
          },
        });
    })
    .then((res) => {
      // update history's wishlist
      console.log("now update room in tradeHistory");
      console.log(_tradeHistory.selling.rooms);
      let roomIdArry = [];
      for (room in _tradeHistory.selling.rooms) {
        console.log(_tradeHistory.selling.rooms[room]);
        roomIdArry.push(_tradeHistory.selling.rooms[room].roomId);
      }
      console.log(roomIdArry);
      db.collection("Nookea-rooms")
        .where({
          _id: _.in(roomIdArry),
        })
        .update({
          data: {
            wishlist: _.set(_wishlist),
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((res) => {
          console.log(res);
        });
    });

  return null;
};

// return[toDelete, toAdd]
function compare2Arr(oldwishlist, newwishlist) {
  let _oldwishlist = Object.assign({}, oldwishlist);
  let _newwishlist = Object.assign({}, newwishlist);
  for (let item in oldwishlist) {
    if (item in newwishlist) {
      delete _oldwishlist[item];
      delete _newwishlist[item];
    }
  }
  return { _newwishlist, _oldwishlist };
}

const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let _wishlist = event.wishlist;
  console.log(_wishlist);
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
      console.log(deleteList);
      console.log(addList);

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
          console.log("sub inc OK");
          console.log(res);
        })
        .catch((res) => {
          console.log("sub inc Bad");
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
          console.log("sub dec OK");
          console.log(res);
        })
        .catch((res) => {
          console.log("sub dec Bad");
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
    });

  // update history's wishlist
  //
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

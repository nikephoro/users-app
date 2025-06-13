const User = require('../models/user.model');

function findAll() {
  const result = User.find();
  return result;
}

function findOne(username) {
  const result = User.findOne({username:username});
  return result;
}

async function findLastInsertedUser(){
  console.log("Find last inserted user");

  try {
    const result = await User.find().sort({_id:-1}).limit(1);
    console.log("Success in finding last inserted user");
    return result[0]
  } catch (err){
    console.log("Problem in finding last inserted user", err);
    return false
  }
}

module.exports = { findAll, findOne, findLastInsertedUser }
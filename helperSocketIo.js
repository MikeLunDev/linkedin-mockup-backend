var Messages = require("./models/message");

const saveMsgOnDB = async msg => {
  await Messages.create(msg);
};

module.exports = saveMsgOnDB;

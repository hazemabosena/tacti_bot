const protobuf = require("protobufjs");
const path = require("path");

async function parsePlayerData(binaryBuffer) {
  try {
    const root = await protobuf.load(path.join(__dirname, "..", "account.proto"));
    const AccountModel = root.lookupType("Meta.Account");
    const message = AccountModel.decode(binaryBuffer);

    const playerObject = AccountModel.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });

    return playerObject;
  } catch (error) {
    console.error("Error decoding player data:", error);
    return null;
  }
}

module.exports = { parsePlayerData };


require("dotenv").config();

const { connectToDatabase, disconnectFromDatabase } = require("../db");
const { getAllGuildConfigs } = require("../utils/clanMissionNotifier");

async function main() {
  let exitCode = 0;

  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    const settingsCollection = db.collection("cm_notification_settings");
    await settingsCollection.createIndex({ _id: 1 });
    if (!(await settingsCollection.indexExists("_id_"))) {
      throw new Error("MongoDB did not confirm the unique guild-key index.");
    }

    const settings = await getAllGuildConfigs();
    console.log(
      `[mongodb] Ping succeeded for ${db.databaseName}; verified the guild-key index and ${settings.length} clan notification setting(s).`
    );
  } catch (error) {
    console.error(
      `[mongodb] Ping or migration verification failed (${error?.name || "Error"}). Check MONGODB_URI, Atlas network access, and database-user permissions.`
    );
    exitCode = 1;
  }

  try {
    await disconnectFromDatabase();
  } catch (error) {
    console.error(`[mongodb] Disconnect failed (${error?.name || "Error"}).`);
    exitCode = 1;
  }

  process.exitCode = exitCode;
}

main();

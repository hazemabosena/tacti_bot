const { MongoClient } = require("mongodb");

const DATABASE_NAME = "TACTIOPBOT";
let mongoClient = null;
let mongoDatabase = null;
let connectPromise = null;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (mongoClient && mongoDatabase) {
    return { configured: true, connected: true, client: mongoClient, db: mongoDatabase, status: "connected" };
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      let client;
      try {
        client = new MongoClient(uri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10_000,
          appName: "TACTIOPBOT",
        });
        await client.connect();
        const database = client.db(DATABASE_NAME);
        await database.command({ ping: 1 });

        mongoClient = client;
        mongoDatabase = database;
        console.log(`[mongodb] Connected to ${DATABASE_NAME}; ping succeeded.`);
        return {
          configured: true,
          connected: true,
          client: mongoClient,
          db: mongoDatabase,
          status: "connected",
        };
      } catch (error) {
        if (client) {
          try {
            await client.close();
          } catch (closeError) {
            console.error(`[mongodb] Failed to close an unsuccessful connection (${closeError?.name || "Error"}).`);
          }
        }
        const errorType = error?.name || "Error";
        throw new Error(
          `MongoDB connection or ping failed (${errorType}); verify Atlas network access and database-user permissions.`
        );
      } finally {
        if (!mongoClient) {
          connectPromise = null;
        }
      }
    })();
  }

  return connectPromise;
}

async function disconnectFromDatabase() {
  if (connectPromise) {
    try {
      await connectPromise;
    } catch {
      return;
    }
  }

  if (!mongoClient) {
    return;
  }

  const client = mongoClient;
  mongoClient = null;
  mongoDatabase = null;
  connectPromise = null;

  try {
    await client.close();
    console.log("[mongodb] Disconnected successfully.");
  } catch (error) {
    throw new Error(`MongoDB disconnect failed (${error?.name || "Error"}).`);
  }
}

function getDb() {
  return mongoDatabase;
}

function isConnected() {
  return Boolean(mongoClient && mongoDatabase);
}

function getMongoStatus() {
  if (!process.env.MONGODB_URI) {
    return { configured: false, connected: false, status: "not_configured" };
  }

  return {
    configured: true,
    connected: isConnected(),
    status: isConnected() ? "connected" : "disconnected",
    database: mongoDatabase?.databaseName || DATABASE_NAME,
  };
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  getDb,
  isConnected,
  getMongoStatus,
};

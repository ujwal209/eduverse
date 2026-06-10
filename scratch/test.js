const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

// Load .env file manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

console.log("Environment variables loaded.");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Defined" : "Undefined");
console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Defined" : "Undefined");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Defined" : "Undefined");

// Read GROQ_API_KEYS exactly how dotenv/Next.js would read it without quotes in .env
const rawKeys = process.env.GROQ_API_KEYS || "";
console.log("Raw GROQ_API_KEYS env value:", JSON.stringify(rawKeys));

const groqApiKeys = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.length > 0);
console.log("Parsed keys length:", groqApiKeys.length);
console.log("Parsed keys:", groqApiKeys);

async function testGroq() {
  if (groqApiKeys.length === 0) {
    console.error("No Groq API keys found!");
    return;
  }
  for (let i = 0; i < groqApiKeys.length; i++) {
    const key = groqApiKeys[i];
    console.log(`Testing key index ${i}: ${key.substring(0, 8)}...`);
    try {
      const model = new ChatGroq({
        apiKey: key,
        model: "llama3-8b-8192",
      });
      const response = await model.invoke([
        new SystemMessage("You are a helpful assistant."),
        new HumanMessage("Hello! Say 'Key is working' if you hear me.")
      ]);
      console.log(`Key ${i} result:`, response.content);
    } catch (err) {
      console.error(`Key ${i} failed:`, err.message);
    }
  }
}

async function testMongo() {
  if (!process.env.MONGO_URI) {
    console.error("No MONGO_URI found!");
    return;
  }
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");
    
    // Check schemas/collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("MongoDB failed:", err.message);
  }
}

async function run() {
  await testMongo();
  await testGroq();
}

run();

// import { PrismaClient } from "@prisma/client";
// import {Kafka} from "kafkajs";

// const TOPIC_NAME = "zap-events"

// const client = new PrismaClient();

// const kafka = new Kafka({
//     clientId: 'outbox-processor',
//     brokers: ['localhost:9092']
// })

// async function main() {
//     const producer =  kafka.producer();
//     await producer.connect();

//     while(1) {
//         const pendingRows = await client.zapRunOutbox.findMany({
//             where :{},
//             take: 10
//         })
//         console.log(pendingRows);

//         producer.send({
//             topic: TOPIC_NAME,
//             messages: pendingRows.map(r => {
//                 return {
//                     value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 })                    
//                 }
//             })
//         })  

//         await client.zapRunOutbox.deleteMany({
//             where: {
//                 id: {
//                     in: pendingRows.map(x => x.id)
//                 }
//             }
//         })

//         await new Promise(r => setTimeout(r, 3000));
//     }
// }

// main();


import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import "dotenv/config";
import fs from "fs";
import path from "path";

const caPath = path.resolve(__dirname, "../certs/ca.pem");
console.log("Resolved CA path:", caPath); // Debug

const TOPIC_NAME = process.env.TOPIC_NAME!;
const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(caPath, "utf-8")],
  },

  sasl: {
    mechanism: "scram-sha-256", // Aiven requires this
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },

});

async function main() {
  const producer = kafka.producer();
  await producer.connect();
  console.log("Producer connected ✅");

  while (true) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    if (pendingRows.length === 0) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    await producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
      })),
    });

    await client.zapRunOutbox.deleteMany({
      where: { id: { in: pendingRows.map((x) => x.id) } },
    });

    console.log(`Produced ${pendingRows.length} messages`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}

main().catch(console.error);

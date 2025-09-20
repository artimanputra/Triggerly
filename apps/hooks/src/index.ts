import express from 'express';
import prisma from '@repo/db/client'; // Import the singleton prisma instance
import { Prisma } from '@prisma/client'; // Import the Prisma namespace for types

const app = express();
app.use(express.json());

// https://hooks.zapier.com/hooks/catch/17043103/22b8496/
// password logic
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // Store in db a new trigger
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {  
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  res.json({
    message: 'Webhook received',
  });
});

app.listen(3002, () => {
  console.log('Server is running on http://localhost:3002');
});

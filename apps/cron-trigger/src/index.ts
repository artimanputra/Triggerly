import { PrismaClient } from "@prisma/client";
import cron, { ScheduledTask } from "node-cron";

const prisma = new PrismaClient();


const activeJobs = new Map<string, { expr: string; task: ScheduledTask }>();

async function refreshCronZaps(): Promise<void> {
  const cronZaps = await prisma.zap.findMany({
    where: {
      trigger: {
        triggerId: "cron",
      },
    },
    include: {
      trigger: true,
    },
  });

  for (const zap of cronZaps) {
    const metadata = zap.trigger?.metadata as {
      isActive: boolean; cronExpr?: string 
} | undefined;
    const cronExpr = metadata?.cronExpr;

    if (!cronExpr) {
      console.warn(`[SKIPPED] Missing cronExpr for zap ${zap.id}`);
      continue;
    }
    if(metadata.isActive===false){
      console.log(`[SKIPPED] Inactive cron zap ${zap.id}`);
      continue;
    }

    const existingJob = activeJobs.get(zap.id);

    // Already registered with same cronExpr → skip
    if (existingJob && existingJob.expr === cronExpr) {
      continue;
    }


    if (existingJob) {
      console.log(`[UPDATED] Stopping old job for zap ${zap.id}`);
      existingJob.task.stop();
      activeJobs.delete(zap.id);
    }

    console.log(`[REGISTERED] Cron zap ${zap.id} on ${cronExpr}`);

    const task: ScheduledTask = cron.schedule(cronExpr, async () => {
      const run = await prisma.zapRun.create({
        data: {
          zapId: zap.id,
          metadata: {},
        },
      });

      await prisma.zapRunOutbox.create({
        data: {
          zapRunId: run.id,
        },
      });

      console.log(`[TRIGGERED] zapId ${zap.id} -> zapRunId ${run.id}`);
    });

    activeJobs.set(zap.id, { expr: cronExpr, task });
  }

  // Remove jobs that are no longer in DB
  for (const [zapId, jobInfo] of activeJobs.entries()) {
    if (!cronZaps.find((z) => z.id === zapId)) {
      console.log(`[REMOVED] Stopping job for deleted zap ${zapId}`);
      jobInfo.task.stop();
      activeJobs.delete(zapId);
    }
  }
}

async function startScheduler(): Promise<void> {
  await refreshCronZaps();

  // Refresh DB every 10 seconds
  cron.schedule("*/10 * * * * *", async () => {
    console.log(`[REFRESH] Checking DB at ${new Date().toISOString()}`);
    await refreshCronZaps();
  });
}

startScheduler().catch((err) => {
  console.error("Scheduler failed:", err);
  process.exit(1);
});

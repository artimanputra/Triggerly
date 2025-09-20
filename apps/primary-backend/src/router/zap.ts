import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import prisma from '@repo/db/client'; // Import the singleton prisma instance
import { Prisma } from '@prisma/client'; // Import the Prisma namespace for types

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    // @ts-ignore
    const id: string = req.id;
    const body = req.body;
    const parsedData = ZapCreateSchema.safeParse(body);
     if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }   

    const zapId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const zap = await prisma.zap.create({
            data: {
                userId: parseInt(id),
                triggerId: "",
                actions: {
                    create: parsedData.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata
                    }))
                }
            }
        })

        const trigger = await tx.trigger.create({
            data: {
                triggerId: parsedData.data.availableTriggerId,
                zapId: zap.id,
                metadata: parsedData.data.triggerMetadata
            }
        });

        await tx.zap.update({
            where: {
                id: zap.id
            },
            data: {
                triggerId: trigger.id
            }
        })

        return zap.id;

    })
    return res.json({
        zapId
    })
})

router.get("/", authMiddleware, async (req, res) => {
    // @ts-ignore
    const id = req.id;
    const zaps = await prisma.zap.findMany({
        where: {
            userId: id
        },
        include: {
            actions: {
               include: {
                    type: true
               }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });

    return res.json({
        zaps
    })
})

router.get("/:zapId", authMiddleware, async (req, res) => {
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;

    const zap = await prisma.zap.findFirst({
        where: {
            id: zapId,
            userId: id
        },
        include: {
            actions: {
               include: {
                    type: true
               }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });

    return res.json({
        zap
    })

})

router.put("/:zapId", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.id;
    const zapId = req.params.zapId;
    const { name, isActive } = req.body;

    try {
        const zap = await prisma.zap.updateMany({
            where: {
                id: zapId,
                userId: parseInt(userId)
            },
            data: {
                ...(name !== undefined && { name }),
                ...(isActive !== undefined && { isActive }),
            }
        });

        if (zap.count === 0) {
            return res.status(404).json({ message: "Zap not found" });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update zap" });
    }
});

router.delete("/:zapId", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.id;
  const zapId = req.params.zapId;

  try {
    // Check ownership
    const zap = await prisma.zap.findFirst({
      where: {
        id: zapId,
        userId: parseInt(userId),
      },
    });

    if (!zap) {
      return res.status(404).json({ message: "Zap not found" });
    }

    // Use a transaction to safely cascade delete
    await prisma.$transaction(async (tx) => {
      // Delete zapRuns + zapRunOutbox
      await tx.zapRunOutbox.deleteMany({
        where: { zapRun: { zapId } },
      });
      await tx.zapRun.deleteMany({
        where: { zapId },
      });

      // Delete actions
      await tx.action.deleteMany({
        where: { zapId },
      });

      // Delete trigger
      await tx.trigger.deleteMany({
        where: { zapId },
      });

      // Finally, delete zap
      await tx.zap.delete({
        where: { id: zapId },
      });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete zap:", err);
    return res.status(500).json({ error: "Failed to delete zap" });
  }
});



export const zapRouter = router;
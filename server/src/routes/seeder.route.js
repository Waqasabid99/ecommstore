import express from "express";
import { prisma } from "../config/prisma.js";
const seedRouter = express.Router();

seedRouter.post("/", async (req, res) => {
    await prisma.category.upsert({
        where: { slug: "uncategorized" },
        update: {},
        create: {
            name: "Uncategorized",
            slug: "uncategorized",
            parentId: null,
        },
    });

    return res
        .status(200)
        .json({ success: true, message: "Database seeded successfully" });
});

export default seedRouter;

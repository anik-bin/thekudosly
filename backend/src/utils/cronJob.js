import cron from "node-cron";
import { User } from "../models/user.models.js";

// Reset kudos daily at midnight
export const startCron = () => {
  cron.schedule("0 0 * * *", async () => {
    await User.updateMany(
      { lastKudosRefresh: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { $set: { kudos: 3, lastKudosRefresh: new Date() } }
    );
    console.log("Kudos reset!");
  });
};
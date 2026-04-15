import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { calendarRouter } from "./calendarRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { employeeRouter } from "./employeeRoutes.js";
import { holidayRouter } from "./holidayRoutes.js";
import { leaveRouter } from "./leaveRoutes.js";
import { profileRouter } from "./profileRoutes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeeRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/leaves", leaveRouter);
apiRouter.use("/holidays", holidayRouter);
apiRouter.use("/calendar", calendarRouter);
apiRouter.use("/dashboard", dashboardRouter);

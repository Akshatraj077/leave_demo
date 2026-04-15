import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAdminDashboard, getEmployeeDashboard } from "../services/dashboardService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());
    const dashboard =
      req.user.role === "ADMIN"
        ? await getAdminDashboard(month, year)
        : await getEmployeeDashboard(req.user, month, year);
    res.json({ dashboard });
  })
);

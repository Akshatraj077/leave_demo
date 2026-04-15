import { Router } from "express";
import { Leave } from "../models/Leave.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyLeave, approveLeave, rejectLeave, serializeLeave } from "../services/leaveService.js";

export const leaveRouter = Router();

leaveRouter.use(requireAuth);

leaveRouter.post(
  "/apply",
  asyncHandler(async (req, res) => {
    const leave = await applyLeave(req.user, req.body);
    res.status(201).json({ leave: serializeLeave(leave) });
  })
);

leaveRouter.get(
  "/my-history",
  asyncHandler(async (req, res) => {
    const leaves = await Leave.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json({ leaves: leaves.map(serializeLeave) });
  })
);

leaveRouter.get(
  "/pending",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const leaves = await Leave.find({ status: "APPLIED" }).populate("user").sort({ createdAt: -1 });
    res.json({ leaves: leaves.map(serializeLeave) });
  })
);

leaveRouter.patch(
  "/:id/approve",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const leave = await approveLeave(req.params.id, req.user);
    res.json({ leave: serializeLeave(leave) });
  })
);

leaveRouter.patch(
  "/:id/reject",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const leave = await rejectLeave(req.params.id, req.user);
    res.json({ leave: serializeLeave(leave) });
  })
);

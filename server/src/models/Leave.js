import mongoose from "mongoose";

export const LEAVE_TYPES = ["CL", "LOP"];
export const LEAVE_DURATIONS = ["FULL", "HALF"];
export const LEAVE_STATUSES = ["APPLIED", "APPROVED", "REJECTED"];

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: true
    },
    duration: {
      type: String,
      enum: LEAVE_DURATIONS,
      required: true
    },
    status: {
      type: String,
      enum: LEAVE_STATUSES,
      default: "APPLIED"
    },
    financialYear: {
      type: String,
      required: true
    },
    decisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    decisionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

leaveSchema.index({ user: 1, date: 1 }, { unique: true });
leaveSchema.index({ status: 1, financialYear: 1 });

export const Leave = mongoose.model("Leave", leaveSchema);

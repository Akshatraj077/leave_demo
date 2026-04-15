import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    financialYear: {
      type: String,
      required: true
    },
    totalLeaves: {
      type: Number,
      required: true,
      min: 0,
      default: 12
    },
    usedLeaves: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    remainingLeaves: {
      type: Number,
      required: true,
      min: 0,
      default: 12
    }
  },
  {
    timestamps: true
  }
);

leaveBalanceSchema.index({ user: 1, financialYear: 1 }, { unique: true });

export const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);

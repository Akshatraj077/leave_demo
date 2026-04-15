import mongoose from "mongoose";

export const ROLES = ["ADMIN", "EMPLOYEE"];
export const EMPLOYMENT_STATUSES = ["ACTIVE", "NOTICE_PERIOD", "PROBATION"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    companyId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ROLES,
      default: "EMPLOYEE"
    },
    employmentStatus: {
      type: String,
      enum: EMPLOYMENT_STATUSES,
      default: "ACTIVE"
    },
    joiningDate: {
      type: Date,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    bankAccountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      default: "Kolkata"
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ role: 1 });
userSchema.index({ employmentStatus: 1 });

export const User = mongoose.model("User", userSchema);

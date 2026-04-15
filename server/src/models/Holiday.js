import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    day: {
      type: String,
      required: true,
      trim: true
    },
    occasion: {
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

holidaySchema.index({ date: 1, location: 1 }, { unique: true });

export const Holiday = mongoose.model("Holiday", holidaySchema);

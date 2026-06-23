const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const activityLogSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    hoTenNhanVien: String,

    action: {
      type: String,
      required: true,
    },

    module: {
      type: String,
      required: true,
    },

    targetId: String,

    targetName: String,

    description: String,

    oldData: Object,

    newData: Object,

    ipAddress: String,

    userAgent: String,
  },
  {
    timestamps: true,
  }
);

activityLogSchema.plugin(tenantPlugin);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
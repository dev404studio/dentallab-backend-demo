const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const quyenSuDungSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true }, // Bỏ unique toàn cục, dùng compound per-tenant
    moTa: String,
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quyenSuDungSchema.plugin(tenantPlugin);
// Tên quyền unique trong từng tenant
quyenSuDungSchema.index({ tenantId: 1, ten: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("QuyenSuDung", quyenSuDungSchema);

const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const nguoiLienHeSchema = new mongoose.Schema(
  {
    hoVaTen: String,
    email: String,
    tieuDe: String,
    soDienThoai: String,
    moTa: String,

    nhaKhoa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaKhoa",
      required: true,
    },
  },
  { timestamps: true }
);

nguoiLienHeSchema.plugin(tenantPlugin);

module.exports = mongoose.model("NguoiLienHe", nguoiLienHeSchema);
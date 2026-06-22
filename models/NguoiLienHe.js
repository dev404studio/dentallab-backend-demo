const mongoose = require("mongoose");

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

module.exports = mongoose.model("NguoiLienHe", nguoiLienHeSchema);
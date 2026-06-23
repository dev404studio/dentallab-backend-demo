const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const benhNhanSchema = new mongoose.Schema(
  {
    hoVaTen: String,
    soHoSo: String,
    CCCD: String,
    gioiTinh: String,
    ngaySinh: Date,
    namSinh: Number,
    quocGia: String,
    tinh: String,
    quanHuyen: String,
    diaChiCuThe: String,
    soDienThoai: String,
    email: String,
    nguon: String,
    nhaKhoa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaKhoa",
      required: true,
    },
  },
  { timestamps: true }
);

benhNhanSchema.plugin(tenantPlugin);

module.exports = mongoose.model("BenhNhan", benhNhanSchema);
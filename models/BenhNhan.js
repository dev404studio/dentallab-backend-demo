const mongoose = require("mongoose");

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

module.exports = mongoose.model("BenhNhan", benhNhanSchema);
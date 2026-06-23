const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const phieuBaoHanhSchema = new mongoose.Schema(
  {
    // Một phiếu bảo hành cho mỗi đơn hàng
    donHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonHang",
      required: true,
      // Bỏ unique toàn cục, dùng compound per-tenant
    },
    maBaoHanh: {
      type: String,
      required: true,
    },
    maQR: {
      type: String,
      required: true,
    },
    nhaKhoa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaKhoa",
      required: true,
    },
    bacSi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NguoiLienHe",
    },
    benhNhan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BenhNhan",
      required: true,
    },
    // Danh sách sản phẩm bảo hành - mỗi sản phẩm có thể có thời gian bảo hành khác nhau
    danhSachBaoHanh: [
      {
        sanPham: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SanPham",
          required: true,
        },
        viTriRang: String, // Vị trí răng
        soLuong: {
          type: Number,
          default: 1,
        },
        mau: String, // Màu sản phẩm
        tenSanPhamBaoHanh: {
          type: String,
          default: "",
        },
        baoHanhTu: {
          type: Date,
          required: true,
        },
        baoHanhDen: {
          type: Date,
          required: true,
        },
      },
    ],
    mauThe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MauTheBaoHanh"
    },
    soDienThoai: String,
    ghiChu: String,
    nhakhoabh: {
      type: String,
      default: "",
    },
    bacsibh: {
      type: String,
      default: "",
    },
    benhnhanbh: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

phieuBaoHanhSchema.plugin(tenantPlugin);
// Mỗi đơn hàng chỉ có 1 phiếu bảo hành trong từng tenant
phieuBaoHanhSchema.index({ tenantId: 1, donHang: 1 }, { unique: true, sparse: true });
phieuBaoHanhSchema.index({ tenantId: 1, maBaoHanh: 1 }, { unique: true, sparse: true });
phieuBaoHanhSchema.index({ tenantId: 1, maQR: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("PhieuBaoHanh", phieuBaoHanhSchema);

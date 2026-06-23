const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const bangGiaSchema = new mongoose.Schema(
  {
    nhaKhoaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaKhoa",
      required: true,
      index: true,
    },

    sanPhamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SanPham",
      required: true,
    },

    donGia: {
      type: Number,
      required: true,
      min: [0, "Đơn giá không được nhỏ hơn 0"],
    },

    ghiChu: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

bangGiaSchema.plugin(tenantPlugin);
// 1 sản phẩm chỉ có 1 giá riêng / 1 nha khoa trong từng tenant
bangGiaSchema.index(
  { tenantId: 1, nhaKhoaId: 1, sanPhamId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.BangGia || mongoose.model("BangGia", bangGiaSchema);
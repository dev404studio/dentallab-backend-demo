const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const nhanVienSchema = new mongoose.Schema(
  {
    hoVaTen: {
      type: String,
      required: true,
    },

    cccd: {
      type: String,
      required: true,
      // Bỏ unique toàn cục, dùng compound per-tenant bên dưới
    },

    diaChi: String,

    soDienThoai: String,

    email: String,

    chucVu: String,

    luongCanBan: {
      type: Number,
      required: true,
      default: 0,
    },

    ngayCongThang: {
      type: Number,
      required: true,
      default: 28,
    },

    trangThai: {
      type: String,
      enum: ["Đang làm", "Nghỉ việc"],
      default: "Đang làm",
    },

    cccdImages: [
      {
        type: String,
      },
    ],

    // Thêm thuộc tính ngày tạo ở đây
    ngayTao: {
      type: Date,
      default: Date.now, // Tự động lấy thời gian hiện tại khi tạo bản ghi
    },
  }
  // Bạn có thể bỏ { timestamps: true } đi nếu không cần dùng đến thuộc tính updatedAt mặc định của Mongoose
);

nhanVienSchema.plugin(tenantPlugin);
// CCCD unique trong từng tenant
nhanVienSchema.index({ tenantId: 1, cccd: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("NhanVien", nhanVienSchema);
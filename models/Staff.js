const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const staffSchema = new mongoose.Schema(
  {
    // tenantId: null → Super Admin (không thuộc tenant nào)
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    // Đánh dấu tài khoản quản trị hệ thống (Super Admin)
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    // MSNV unique trong từng tenant (không còn global unique)
    MSNV: { type: String, sparse: true, index: true },
    HoTenNV: { type: String, required: true },
    Email: {
      type: String,
      required: true,
      unique: true, // Email vẫn là unique toàn cục để đăng nhập
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email không hợp lệ"]
    },
    Password: { type: String, required: true },
    quyenSuDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuyenSuDung",
    },
    Permissions: String,
    DienThoai: { type: String, default: "" },
    DiaChi: { type: String, default: "" },
    GioiThieu: { type: String, default: "" },
    Status: { type: Number, enum: [0, 1], default: 1 }, // 1 = active, 0 = inactive
  },
  { timestamps: true }
);

// Index hợp lệ: MSNV unique trong từng tenant
staffSchema.index({ tenantId: 1, MSNV: 1 }, { unique: true, sparse: true });

// // 🔐 Hash password trước khi lưu
staffSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
});

// 🔑 So sánh password
staffSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.Password);
};

module.exports = mongoose.model("Staff", staffSchema);
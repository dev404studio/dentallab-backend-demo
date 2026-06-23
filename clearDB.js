/**
 * clearDB.js
 * Xóa toàn bộ dữ liệu trong database (giữ lại Super Admin nếu muốn).
 * Chạy: node clearDB.js
 * Chạy và xóa luôn Super Admin: node clearDB.js --all
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db.config");

const ActivityLog = require("./models/ActivityLog");
const BangGia = require("./models/BangGia");
const BangLuong = require("./models/BangLuong");
const BenhNhan = require("./models/BenhNhan");
const ChamSocKhachHang = require("./models/ChamSocKhachHang");
const CongDoan = require("./models/CongDoan");
const CongTy = require("./models/CongTy");
const Counter = require("./models/Counter");
const DonHang = require("./models/DonHang");
const GhiChu = require("./models/GhiChu");
const HoaDon = require("./models/HoaDon");
const MauTheBaoHanh = require("./models/MauTheBaoHanh");
const NguoiLienHe = require("./models/NguoiLienHe");
const NhaKhoa = require("./models/NhaKhoa");
const NhanVien = require("./models/NhanVien");
const PhieuBaoHanh = require("./models/PhieuBaoHanh");
const PhieuThu = require("./models/PhieuThu");
const QuyenSuDung = require("./models/QuyenSuDung");
const SanPham = require("./models/SanPham");
const Staff = require("./models/Staff");
const Tenant = require("./models/Tenant");

const keepSuperAdmin = !process.argv.includes("--all");

async function clearDB() {
    await connectDB();

    console.log("⚠️  Bắt đầu xóa dữ liệu...\n");

    const collections = [
        { model: ActivityLog,       name: "ActivityLog" },
        { model: BangGia,           name: "BangGia" },
        { model: BangLuong,         name: "BangLuong" },
        { model: BenhNhan,          name: "BenhNhan" },
        { model: ChamSocKhachHang,  name: "ChamSocKhachHang" },
        { model: CongDoan,          name: "CongDoan" },
        { model: CongTy,            name: "CongTy" },
        { model: Counter,           name: "Counter" },
        { model: DonHang,           name: "DonHang" },
        { model: GhiChu,            name: "GhiChu" },
        { model: HoaDon,            name: "HoaDon" },
        { model: MauTheBaoHanh,     name: "MauTheBaoHanh" },
        { model: NguoiLienHe,       name: "NguoiLienHe" },
        { model: NhaKhoa,           name: "NhaKhoa" },
        { model: NhanVien,          name: "NhanVien" },
        { model: PhieuBaoHanh,      name: "PhieuBaoHanh" },
        { model: PhieuThu,          name: "PhieuThu" },
        { model: QuyenSuDung,       name: "QuyenSuDung" },
        { model: SanPham,           name: "SanPham" },
        { model: Tenant,            name: "Tenant" },
    ];

    for (const { model, name } of collections) {
        const result = await model.deleteMany({});
        console.log(`  ✅ ${name.padEnd(20)} — xóa ${result.deletedCount} bản ghi`);
    }

    // Staff: xóa tất cả hoặc giữ lại Super Admin
    if (keepSuperAdmin) {
        const result = await Staff.deleteMany({ isSuperAdmin: { $ne: true } });
        console.log(`  ✅ Staff               — xóa ${result.deletedCount} bản ghi (giữ lại Super Admin)`);
    } else {
        const result = await Staff.deleteMany({});
        console.log(`  ✅ Staff               — xóa ${result.deletedCount} bản ghi`);
    }

    console.log("\n🎉 Xóa dữ liệu hoàn tất!");
    if (keepSuperAdmin) {
        console.log("   ℹ️  Super Admin vẫn được giữ lại. Dùng --all để xóa luôn.");
    }

    await mongoose.disconnect();
}

clearDB().catch((err) => {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
});

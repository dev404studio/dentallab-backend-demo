const Tenant = require("../models/Tenant");
const Staff = require("../models/Staff");
const QuyenSuDung = require("../models/QuyenSuDung");
const Counter = require("../models/Counter");

/**
 * [POST] /api/tenants
 * Super Admin tạo tenant mới và tài khoản admin cho tenant đó
 */
exports.createTenant = async (req, res) => {
    try {
        const {
            ownerEmail,
            ownerName,
            phone,
            trialDays = 7,
            notes,
            adminPassword,
        } = req.body;

        if (!ownerEmail || !adminPassword) {
            return res.status(400).json({
                message: "Thiếu thông tin: ownerEmail, adminPassword là bắt buộc",
            });
        }

        // Kiểm tra email admin đã tồn tại chưa (global unique)
        const emailExist = await Staff.findOne({ Email: ownerEmail.toLowerCase() });
        if (emailExist) {
            return res.status(400).json({ message: "Email đã được sử dụng bởi tài khoản khác" });
        }

        // Auto-generate mã thuê bao: TB0001, TB0002, ...
        const counter = await Counter.findOneAndUpdate(
            { _id: "tenant" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const tenantCode = `TB${String(counter.seq).padStart(4, "0")}`;

        // Dùng ownerName làm tenantName (fallback về phần trước @ của email)
        const tenantName = ownerName?.trim() || ownerEmail.split("@")[0];

        // Tính ngày hết hạn dùng thử
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + Number(trialDays));

        // Tạo tenant
        const tenant = await Tenant.create({
            tenantCode,
            tenantName,
            ownerEmail,
            ownerName: ownerName || "",
            phone: phone || "",
            trialEndDate,
            notes: notes || "",
            status: "trial",
        });

        // Tạo quyền Admin cho tenant này
        const adminRole = await QuyenSuDung.create({
            ten: "Admin",
            moTa: "Quản trị viên",
            permissions: [],
            isActive: true,
            tenantId: tenant._id,
        });

        // Tạo tài khoản Admin cho tenant
        const adminStaff = new Staff({
            HoTenNV: ownerName || tenantName,
            Email: ownerEmail.toLowerCase(),
            Password: adminPassword,
            tenantId: tenant._id,
            quyenSuDung: adminRole._id,
            Status: 1,
        });
        await adminStaff.save();

        res.status(201).json({
            message: "Tạo tenant thành công",
            tenant: {
                _id: tenant._id,
                tenantCode: tenant.tenantCode,
                tenantName: tenant.tenantName,
                ownerEmail: tenant.ownerEmail,
                trialStartDate: tenant.trialStartDate,
                trialEndDate: tenant.trialEndDate,
                status: tenant.status,
                maxUsers: tenant.maxUsers,
            },
            adminAccount: {
                _id: adminStaff._id,
                Email: adminStaff.Email,
                HoTenNV: adminStaff.HoTenNV,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [GET] /api/tenants
 * Super Admin lấy danh sách tất cả tenants
 */
exports.getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();

        // Đếm số tài khoản của mỗi tenant
        const tenantsWithUserCount = await Promise.all(
            tenants.map(async (tenant) => {
                const userCount = await Staff.countDocuments({ tenantId: tenant._id });
                const isExpired =
                    tenant.status === "expired" ||
                    (tenant.status === "trial" && new Date() > tenant.trialEndDate);
                return {
                    ...tenant,
                    userCount,
                    isExpired,
                    daysRemaining:
                        tenant.status === "trial"
                            ? Math.max(
                                0,
                                Math.ceil((new Date(tenant.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
                            )
                            : null,
                };
            })
        );

        res.json(tenantsWithUserCount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [GET] /api/tenants/:id
 * Super Admin xem chi tiết 1 tenant
 */
exports.getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id).lean();
        if (!tenant) {
            return res.status(404).json({ message: "Tenant không tồn tại" });
        }

        const users = await Staff.find({ tenantId: tenant._id })
            .select("-Password")
            .populate("quyenSuDung")
            .lean();

        res.json({ ...tenant, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [PATCH] /api/tenants/:id/extend
 * Super Admin gia hạn dùng thử
 */
exports.extendTrial = async (req, res) => {
    try {
        const { days } = req.body;

        if (!days || isNaN(days) || Number(days) <= 0) {
            return res.status(400).json({ message: "Số ngày gia hạn không hợp lệ" });
        }

        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant không tồn tại" });
        }

        // Nếu đã hết hạn, tính từ ngày hôm nay; nếu chưa hết, tính từ ngày hết hạn cũ
        const baseDate =
            tenant.status === "expired" || new Date() > tenant.trialEndDate
                ? new Date()
                : new Date(tenant.trialEndDate);

        baseDate.setDate(baseDate.getDate() + Number(days));
        tenant.trialEndDate = baseDate;
        tenant.status = "trial";
        await tenant.save();

        res.json({
            message: `Đã gia hạn ${days} ngày`,
            tenant: {
                _id: tenant._id,
                tenantName: tenant.tenantName,
                trialEndDate: tenant.trialEndDate,
                status: tenant.status,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [PATCH] /api/tenants/:id/status
 * Super Admin thay đổi trạng thái tenant (active / suspended / trial / expired)
 */
exports.updateTenantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["trial", "active", "suspended", "expired"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!tenant) {
            return res.status(404).json({ message: "Tenant không tồn tại" });
        }

        res.json({ message: "Cập nhật trạng thái thành công", tenant });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [PATCH] /api/tenants/:id
 * Super Admin cập nhật thông tin tenant
 */
exports.updateTenant = async (req, res) => {
    try {
        const { tenantName, ownerName, phone, maxUsers, notes } = req.body;

        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            { tenantName, ownerName, phone, maxUsers, notes },
            { new: true, runValidators: true }
        );

        if (!tenant) {
            return res.status(404).json({ message: "Tenant không tồn tại" });
        }

        res.json({ message: "Cập nhật thành công", tenant });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [DELETE] /api/tenants/:id
 * Super Admin xóa tenant (xóa cả dữ liệu liên quan)
 * ⚠️ Thao tác không thể hoàn tác
 */
exports.deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant không tồn tại" });
        }

        // Xóa tất cả staff thuộc tenant
        await Staff.deleteMany({ tenantId: tenant._id });

        // Xóa tenant
        await Tenant.findByIdAndDelete(req.params.id);

        res.json({ message: "Đã xóa tenant và tất cả tài khoản liên quan" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

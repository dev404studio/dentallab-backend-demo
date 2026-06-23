const express = require("express");
const router = express.Router();
const {
    createTenant,
    getAllTenants,
    getTenantById,
    extendTrial,
    updateTenantStatus,
    updateTenant,
    deleteTenant,
} = require("../controllers/tenantController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { APP_ROLES } = require("../utils/roleResolver");

// Tất cả routes này chỉ dành cho Super Admin
const isSuperAdmin = [verifyToken, authorizeRoles(APP_ROLES.SUPER_ADMIN)];

router.get("/", isSuperAdmin, getAllTenants);
router.post("/", isSuperAdmin, createTenant);
router.get("/:id", isSuperAdmin, getTenantById);
router.patch("/:id", isSuperAdmin, updateTenant);
router.patch("/:id/extend", isSuperAdmin, extendTrial);
router.patch("/:id/status", isSuperAdmin, updateTenantStatus);
router.delete("/:id", isSuperAdmin, deleteTenant);

module.exports = router;

const mongoose = require("mongoose");
const tenantPlugin = require("../utils/tenantPlugin");

const congDoanSchema = new mongoose.Schema({
    tenCongDoan: {
        type: String,
        required: [true, "Vui lòng nhập tên công đoạn"],
        // Bỏ unique toàn cục, dùng compound index per-tenant bên dưới
        trim: true
    },
    moTa: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

congDoanSchema.plugin(tenantPlugin);
// Tên công đoạn unique trong từng tenant
congDoanSchema.index({ tenantId: 1, tenCongDoan: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("CongDoan", congDoanSchema);
/**
 * tenantPlugin.js
 *
 * Mongoose plugin tự động:
 * 1. Thêm trường tenantId vào schema
 * 2. Inject tenantId vào mọi find/update query
 * 3. Inject tenantId khi tạo document mới
 *
 * Dùng AsyncLocalStorage (tenantContext) để lấy tenantId mà không cần
 * truyền tay qua từng controller.
 */
const mongoose = require("mongoose");
const { getTenantId } = require("./tenantContext");

const QUERY_METHODS = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "findOneAndReplace",
    "countDocuments",
    "count",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "distinct",
];

function tenantPlugin(schema) {
    // 1. Thêm trường tenantId vào schema
    schema.add({
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            index: true,
            // Không required ở đây để không phá vỡ dữ liệu cũ và super admin
        },
    });

    // 2. Auto-inject tenantId vào tất cả find/update/delete queries
    QUERY_METHODS.forEach((method) => {
        schema.pre(method, function () {
            const tenantId = getTenantId();
            if (!tenantId) return; // super admin hoặc không có context → bỏ qua
            const filter = this.getFilter ? this.getFilter() : this._conditions;
            if (filter && filter.tenantId === undefined) {
                this.where({ tenantId });
            }
        });
    });

    // 3. Auto-inject tenantId khi save document mới
    schema.pre("save", function () {
        const tenantId = getTenantId();
        if (tenantId && !this.tenantId) {
            this.tenantId = tenantId;
        }
    });

    // 4. Auto-inject tenantId khi insertMany
    schema.pre("insertMany", function (next, docs) {
        const tenantId = getTenantId();
        if (tenantId && Array.isArray(docs)) {
            docs.forEach((doc) => {
                if (!doc.tenantId) doc.tenantId = tenantId;
            });
        }
        next();
    });
}

module.exports = tenantPlugin;

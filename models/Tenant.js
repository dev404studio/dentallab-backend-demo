const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
    {
        tenantCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        tenantName: {
            type: String,
            required: true,
            trim: true,
        },
        ownerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        ownerName: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        trialStartDate: {
            type: Date,
            default: Date.now,
        },
        trialEndDate: {
            type: Date,
            required: true,
        },
        // trial | active | suspended | expired
        status: {
            type: String,
            enum: ["trial", "active", "suspended", "expired"],
            default: "trial",
        },
        maxUsers: {
            type: Number,
            default: 5,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Virtual: kiểm tra còn hạn dùng thử không
tenantSchema.virtual("isActive").get(function () {
    if (this.status === "suspended" || this.status === "expired") return false;
    if (this.status === "trial") {
        return new Date() <= this.trialEndDate;
    }
    return this.status === "active";
});

module.exports = mongoose.model("Tenant", tenantSchema);

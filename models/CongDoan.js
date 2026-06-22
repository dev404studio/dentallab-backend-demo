const mongoose = require("mongoose");

const congDoanSchema = new mongoose.Schema({
    tenCongDoan: {
        type: String,
        required: [true, "Vui lòng nhập tên công đoạn"],
        unique: true, // Không cho phép trùng tên công đoạn trong kho
        trim: true
    },
    moTa: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("CongDoan", congDoanSchema);
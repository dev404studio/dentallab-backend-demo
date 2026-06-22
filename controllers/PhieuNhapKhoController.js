const PhieuNhapKho = require('../models/PhieuNhapKho');

exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await PhieuNhapKho.countDocuments();
        const phieuNhapKhos = await PhieuNhapKho.find()
            .select("soPhieu ngayTao nhaCungCap danhSachVatLieu")
            .populate("nhaCungCap", "ten")
            .sort({ ngayTao: -1 })
            .skip(skip)
            .limit(limit);

        const data = phieuNhapKhos.map(phieu => {
            const tongTien = phieu.danhSachVatLieu.reduce(
                (sum, item) => sum + (item.thanhTien || 0),
                0
            );

            return {
                ...phieu.toObject(),
                tongTien
            };
        });

        res.status(200).json({
            success: true,
            data,
            total,
            page,
            limit,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách phiếu nhập kho",
            error: error.message,
        });
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const populate = [
            {
                path: "nhaCungCap",
                select: "ten"
            },
            {
                path: "danhSachVatLieu.vatLieu",
                select: "tenVatLieu"
            },
            {
                path: "danhSachVatLieu",
                select: "soLuong donGia thanhTien moTa"
            }
        ];

        const phieuNhapKho = await PhieuNhapKho.findById(id).populate(populate);
        if (!phieuNhapKho) {
            return res.status(404).json({
                success: false,
                message: "Phiếu nhập kho không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            data: phieuNhapKho
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy phiếu nhập kho",
            error: error.message
        });
    }
}

exports.create = async (req, res) => {
    try {
        const { nhaCungCap, danhSachVatLieu, ghiChu, nguoiTao, ngayTao } = req.body;
        const newPhieuNhapKho = new PhieuNhapKho({
            nhaCungCap,
            danhSachVatLieu,
            ghiChu,
            nguoiTao,
            ngayTao
        });
        const savedPhieuNhapKho = await newPhieuNhapKho.save();
        res.status(201).json({
            success: true,
            data: savedPhieuNhapKho
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo phiếu nhập kho",
            error: error.message
        });
    }
}

exports.update = async (req, res) => {

}

exports.delete = async (req, res) => {

}
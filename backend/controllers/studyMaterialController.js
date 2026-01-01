const { StudyMaterialSection, StudyMaterial, Class, Subject, User, Student } = require("../models");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const execFileAsync = promisify(execFile);

// FFmpeg binary path - static binary in project
const FFMPEG_PATH = path.join(__dirname, "../bin/ffmpeg.exe");

// =====================
// SECTION CONTROLLERS
// =====================

// Create a new study material section
exports.createSection = async (req, res) => {
    try {
        const { title, description, classId, sectionId, subjectId, isPublished } = req.body;
        const schoolId = req.user.schoolId;
        const createdBy = req.user.id;

        // Validate class belongs to school
        const classObj = await Class.findOne({ where: { id: classId, schoolId } });
        if (!classObj) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        // Validate subject belongs to school
        const subject = await Subject.findOne({ where: { id: subjectId, schoolId } });
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        const section = await StudyMaterialSection.create({
            schoolId,
            title,
            description,
            classId,
            sectionId: sectionId || null,
            subjectId,
            createdBy,
            isPublished: isPublished || false,
        });

        res.status(201).json({
            success: true,
            message: "Study material section created successfully",
            data: { section }
        });
    } catch (error) {
        console.error("Create section error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all sections with filters
exports.getAllSections = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { classId, subjectId, sectionId } = req.query;

        const where = { schoolId };

        // For students, filter by their class and only show published
        if (req.user.role === 'STUDENT') {
            const student = await Student.findOne({ where: { parentId: req.user.id } });
            if (student) {
                where.classId = student.classId;
                where.isPublished = true;
                // Filter by section if student has one
                if (student.section) {
                    where[Op.or] = [
                        { sectionId: null },
                        { sectionId: student.section }
                    ];
                }
            }
        } else if (req.user.role === 'PARENT') {
            // For parents, get their children's classes
            const students = await Student.findAll({ where: { parentId: req.user.id } });
            const classIds = students.map(s => s.classId);
            where.classId = { [Op.in]: classIds };
            where.isPublished = true;
        } else {
            // For teachers/admins, apply filters if provided
            if (classId) where.classId = classId;
            if (subjectId) where.subjectId = subjectId;
            if (sectionId) where.sectionId = sectionId;
        }

        const sections = await StudyMaterialSection.findAll({
            where,
            include: [
                { model: Class, attributes: ['id', 'name', 'section'] },
                { model: Subject, attributes: ['id', 'name'] },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
                {
                    model: StudyMaterial,
                    as: 'materials',
                    attributes: ['id', 'title', 'type'],
                    where: req.user.role === 'STUDENT' || req.user.role === 'PARENT'
                        ? { isPublished: true }
                        : {},
                    required: false
                }
            ],
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: { sections }
        });
    } catch (error) {
        console.error("Get sections error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get section by ID with all materials
exports.getSectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const section = await StudyMaterialSection.findOne({
            where: { id, schoolId },
            include: [
                { model: Class, attributes: ['id', 'name', 'section'] },
                { model: Subject, attributes: ['id', 'name'] },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
                {
                    model: StudyMaterial,
                    as: 'materials',
                    include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
                    order: [['order', 'ASC'], ['createdAt', 'DESC']]
                }
            ]
        });

        if (!section) {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        // Check access for students
        if (req.user.role === 'STUDENT' && !section.isPublished) {
            return res.status(403).json({ success: false, message: "This section is not published" });
        }

        res.status(200).json({
            success: true,
            data: { section }
        });
    } catch (error) {
        console.error("Get section error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update section
exports.updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;
        const { title, description, classId, sectionId, subjectId, isPublished, order } = req.body;

        const section = await StudyMaterialSection.findOne({ where: { id, schoolId } });
        if (!section) {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        // Only owner or admin can update
        if (section.createdBy !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: "Not authorized to update this section" });
        }

        await section.update({
            title: title || section.title,
            description: description !== undefined ? description : section.description,
            classId: classId || section.classId,
            sectionId: sectionId !== undefined ? sectionId : section.sectionId,
            subjectId: subjectId || section.subjectId,
            isPublished: isPublished !== undefined ? isPublished : section.isPublished,
            order: order !== undefined ? order : section.order,
        });

        res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: { section }
        });
    } catch (error) {
        console.error("Update section error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete section with all materials
exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const section = await StudyMaterialSection.findOne({
            where: { id, schoolId },
            include: [{ model: StudyMaterial, as: 'materials' }]
        });

        if (!section) {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        // Only owner or admin can delete
        if (section.createdBy !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this section" });
        }

        // Delete all material files
        for (const material of section.materials) {
            await deleteMaterialFiles(material);
        }

        // Delete section (cascades to materials in DB)
        await section.destroy();

        res.status(200).json({
            success: true,
            message: "Section and all materials deleted successfully"
        });
    } catch (error) {
        console.error("Delete section error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle section publish status
exports.toggleSectionPublish = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const section = await StudyMaterialSection.findOne({ where: { id, schoolId } });
        if (!section) {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        await section.update({ isPublished: !section.isPublished });

        res.status(200).json({
            success: true,
            message: `Section ${section.isPublished ? 'published' : 'unpublished'} successfully`,
            data: { section }
        });
    } catch (error) {
        console.error("Toggle publish error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================
// MATERIAL CONTROLLERS
// =====================

// Upload material to a section
exports.uploadMaterial = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { title, description, isPublished } = req.body;
        const schoolId = req.user.schoolId;
        const uploadedBy = req.user.id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Validate section
        const section = await StudyMaterialSection.findOne({ where: { id: sectionId, schoolId } });
        if (!section) {
            // Clean up temp file
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        const fileType = req.fileType || detectFileType(req.file.originalname);
        const fileSize = req.file.size;
        const originalFileName = req.file.originalname;

        // Create material directory
        const materialId = require('uuid').v4();
        const materialDir = path.join(
            __dirname,
            `../uploads/study-materials/${schoolId}/${sectionId}/${materialId}`
        );
        fs.mkdirSync(materialDir, { recursive: true });

        let filePath, hlsPath = null, duration = null;

        if (fileType === 'VIDEO') {
            // Convert to HLS
            try {
                const result = await convertToHLS(req.file.path, materialDir, materialId);
                hlsPath = result.hlsPath;
                duration = result.duration;
                filePath = materialDir;

                // Delete original temp file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (conversionError) {
                console.error("HLS conversion error:", conversionError);
                // Clean up
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                if (fs.existsSync(materialDir)) fs.rmSync(materialDir, { recursive: true });
                return res.status(500).json({
                    success: false,
                    message: "Video conversion failed: " + conversionError.message
                });
            }
        } else {
            // For PDF/PPT, just move the file
            const ext = path.extname(req.file.originalname);
            const destPath = path.join(materialDir, `document${ext}`);
            fs.renameSync(req.file.path, destPath);
            filePath = destPath;
        }

        // Create material record
        const material = await StudyMaterial.create({
            id: materialId,
            studyMaterialSectionId: sectionId,
            schoolId,
            title: title || originalFileName,
            description,
            type: fileType,
            filePath,
            hlsPath,
            originalFileName,
            fileSize,
            duration,
            uploadedBy,
            isPublished: isPublished === 'true' || isPublished === true,
        });

        res.status(201).json({
            success: true,
            message: `${fileType} uploaded successfully`,
            data: { material }
        });
    } catch (error) {
        console.error("Upload material error:", error);
        // Clean up temp file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOne({
            where: { id, schoolId },
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'name'] },
                {
                    model: StudyMaterialSection,
                    as: 'section',
                    include: [
                        { model: Class, attributes: ['id', 'name', 'section'] },
                        { model: Subject, attributes: ['id', 'name'] }
                    ]
                }
            ]
        });

        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        // Check access for students
        if ((req.user.role === 'STUDENT' || req.user.role === 'PARENT') && !material.isPublished) {
            return res.status(403).json({ success: false, message: "This material is not published" });
        }

        res.status(200).json({
            success: true,
            data: { material }
        });
    } catch (error) {
        console.error("Get material error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update material
exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;
        const { title, description, isPublished, order } = req.body;

        const material = await StudyMaterial.findOne({ where: { id, schoolId } });
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        // Only owner or admin can update
        if (material.uploadedBy !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: "Not authorized to update this material" });
        }

        await material.update({
            title: title || material.title,
            description: description !== undefined ? description : material.description,
            isPublished: isPublished !== undefined ? isPublished : material.isPublished,
            order: order !== undefined ? order : material.order,
        });

        res.status(200).json({
            success: true,
            message: "Material updated successfully",
            data: { material }
        });
    } catch (error) {
        console.error("Update material error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOne({ where: { id, schoolId } });
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        // Only owner or admin can delete
        if (material.uploadedBy !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this material" });
        }

        // Delete files
        await deleteMaterialFiles(material);

        // Delete from DB
        await material.destroy();

        res.status(200).json({
            success: true,
            message: "Material deleted successfully"
        });
    } catch (error) {
        console.error("Delete material error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle material publish status
exports.toggleMaterialPublish = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOne({ where: { id, schoolId } });
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        await material.update({ isPublished: !material.isPublished });

        res.status(200).json({
            success: true,
            message: `Material ${material.isPublished ? 'published' : 'unpublished'} successfully`,
            data: { material }
        });
    } catch (error) {
        console.error("Toggle publish error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================
// STREAMING CONTROLLERS
// =====================

// Get stream token for video
exports.getStreamToken = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOne({
            where: { id, schoolId, type: 'VIDEO' },
            include: [{ model: StudyMaterialSection, as: 'section' }]
        });

        if (!material) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (!material.hlsPath) {
            return res.status(400).json({ success: false, message: "Video is not ready for streaming" });
        }

        // Check if published for students
        if ((req.user.role === 'STUDENT' || req.user.role === 'PARENT') && !material.isPublished) {
            return res.status(403).json({ success: false, message: "This video is not published" });
        }

        // Validate student enrollment
        if (req.user.role === 'STUDENT') {
            const student = await Student.findOne({ where: { parentId: req.user.id } });
            if (!student || student.classId !== material.section.classId) {
                return res.status(403).json({ success: false, message: "Not enrolled in this class" });
            }
        }

        // Generate stream token (expires in 2 hours)
        const streamToken = jwt.sign(
            {
                materialId: material.id,
                userId: req.user.id,
                schoolId
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            success: true,
            data: {
                streamToken,
                streamUrl: `/api/study-materials/hls/${streamToken}/master.m3u8`,
                material: {
                    id: material.id,
                    title: material.title,
                    description: material.description,
                    duration: material.duration
                }
            }
        });
    } catch (error) {
        console.error("Get stream token error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Stream HLS files (m3u8 and ts segments)
exports.streamHLS = async (req, res) => {
    try {
        const { token, filename } = req.params;

        // Validate token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired stream token" });
        }

        const material = await StudyMaterial.findOne({
            where: { id: decoded.materialId, schoolId: decoded.schoolId }
        });

        if (!material || !material.hlsPath) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // Construct file path
        const hlsDir = path.dirname(material.hlsPath);
        const filePath = path.join(hlsDir, filename);

        // Security: Ensure requested file is within the material directory
        const resolvedPath = path.resolve(filePath);
        const resolvedDir = path.resolve(hlsDir);
        if (!resolvedPath.startsWith(resolvedDir)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        // Set appropriate content type
        const ext = path.extname(filename).toLowerCase();
        if (ext === '.m3u8') {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (ext === '.ts') {
            res.setHeader('Content-Type', 'video/mp2t');
        }

        // Stream the file
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error("Stream HLS error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Download document (PDF/PPT)
exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOne({
            where: { id, schoolId, type: { [Op.in]: ['PDF', 'PPT'] } },
            include: [{ model: StudyMaterialSection, as: 'section' }]
        });

        if (!material) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        // Check if published for students
        if ((req.user.role === 'STUDENT' || req.user.role === 'PARENT') && !material.isPublished) {
            return res.status(403).json({ success: false, message: "This document is not published" });
        }

        // Validate student enrollment
        if (req.user.role === 'STUDENT') {
            const student = await Student.findOne({ where: { parentId: req.user.id } });
            if (!student || student.classId !== material.section.classId) {
                return res.status(403).json({ success: false, message: "Not enrolled in this class" });
            }
        }

        if (!fs.existsSync(material.filePath)) {
            return res.status(404).json({ success: false, message: "File not found on server" });
        }

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${material.originalFileName}"`);
        res.setHeader('Content-Type', material.type === 'PDF' ? 'application/pdf' : 'application/vnd.ms-powerpoint');

        fs.createReadStream(material.filePath).pipe(res);
    } catch (error) {
        console.error("Download document error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================
// HELPER FUNCTIONS
// =====================

// Convert video to HLS format
async function convertToHLS(inputPath, outputDir, materialId) {
    const outputPath = path.join(outputDir, 'master.m3u8');

    // Check if FFmpeg exists
    if (!fs.existsSync(FFMPEG_PATH)) {
        throw new Error(`FFmpeg not found at ${FFMPEG_PATH}. Please download and place the static binary.`);
    }

    const args = [
        '-i', inputPath,
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-start_number', '0',
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
        '-f', 'hls',
        outputPath
    ];

    await execFileAsync(FFMPEG_PATH, args);

    // Try to get video duration using FFprobe (optional)
    let duration = null;
    const ffprobePath = path.join(__dirname, "../bin/ffprobe.exe");
    if (fs.existsSync(ffprobePath)) {
        try {
            const { stdout } = await execFileAsync(ffprobePath, [
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                inputPath
            ]);
            const info = JSON.parse(stdout);
            duration = Math.round(parseFloat(info.format.duration));
        } catch (e) {
            console.log("Could not get video duration:", e.message);
        }
    }

    return { hlsPath: outputPath, duration };
}

// Delete material files from filesystem
async function deleteMaterialFiles(material) {
    try {
        if (material.type === 'VIDEO') {
            // Delete entire video directory
            const videoDir = path.dirname(material.hlsPath || material.filePath);
            if (fs.existsSync(videoDir)) {
                fs.rmSync(videoDir, { recursive: true });
            }
        } else {
            // Delete document file
            if (material.filePath && fs.existsSync(material.filePath)) {
                fs.unlinkSync(material.filePath);
            }
            // Also try to delete parent directory if empty
            const parentDir = path.dirname(material.filePath);
            if (fs.existsSync(parentDir) && fs.readdirSync(parentDir).length === 0) {
                fs.rmdirSync(parentDir);
            }
        }
    } catch (e) {
        console.error("Error deleting material files:", e);
    }
}

// Detect file type from filename
function detectFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext)) {
        return 'VIDEO';
    } else if (ext === '.pdf') {
        return 'PDF';
    } else if (['.ppt', '.pptx'].includes(ext)) {
        return 'PPT';
    }
    return 'VIDEO'; // Default
}

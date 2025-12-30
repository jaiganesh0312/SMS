const { Gallery, GalleryImage } = require("../models");
const fs = require("fs");
const path = require("path");

// Helper to append base URL
const appendBaseUrl = (req, imagePath) => {
    return `${req.protocol}://${req.get("host")}${imagePath}`;
};

// Create Gallery
exports.createGallery = async (req, res) => {
    try {
        const { title, description, eventDate } = req.body;
        const schoolId = req.user.schoolId;

        const gallery = await Gallery.create({
            schoolId,
            title,
            description,
            eventDate
        });

        res.status(201).json({
            success: true,
            message: "Gallery created successfully",
            data: { gallery }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Images to Gallery
exports.addImages = async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        const gallery = await Gallery.findByPk(id);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        const imageRecords = files.map(file => ({
            galleryId: id,
            imageUrl: `/uploads/gallery/${file.filename}`
        }));

        await GalleryImage.bulkCreate(imageRecords);

        // Format for response
        const responseImages = imageRecords.map(img => ({
            ...img,
            imageUrl: appendBaseUrl(req, img.imageUrl)
        }));

        res.status(201).json({
            success: true,
            message: `${files.length} images added successfully`,
            data: { images: responseImages }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Galleries
exports.getAllGalleries = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const galleries = await Gallery.findAll({
            where: { schoolId },
            include: [
                {
                    model: GalleryImage,
                    as: "images",
                    limit: 1 // Fetch 1 image as thumbnail
                }
            ],
            order: [["eventDate", "DESC"]]
        });

        const formattedGalleries = galleries.map(gallery => {
            const galleryJSON = gallery.toJSON();
            if (galleryJSON.images) {
                galleryJSON.images = galleryJSON.images.map(img => ({
                    ...img,
                    imageUrl: appendBaseUrl(req, img.imageUrl)
                }));
            }
            return galleryJSON;
        });

        res.status(200).json({
            success: true,
            data: { galleries: formattedGalleries }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Gallery
exports.getGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const gallery = await Gallery.findOne({
            where: { id },
            include: [{ model: GalleryImage, as: "images" }]
        });

        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        const galleryJSON = gallery.toJSON();
        galleryJSON.images = galleryJSON.images.map(img => ({
            ...img,
            imageUrl: appendBaseUrl(req, img.imageUrl)
        }));

        res.status(200).json({
            success: true,
            data: { gallery: galleryJSON }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Gallery
exports.deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const gallery = await Gallery.findByPk(id, {
            include: [{ model: GalleryImage, as: "images" }]
        });

        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        // Delete files from filesystem
        gallery.images.forEach(img => {
            const filePath = path.join(__dirname, "..", img.imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await gallery.destroy(); // Cascade deletes images in DB

        res.status(200).json({
            success: true,
            message: "Gallery and images deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

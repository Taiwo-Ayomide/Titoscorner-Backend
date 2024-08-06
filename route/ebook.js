const Ebook = require("../Model/Ebook");
const router = require("express").Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('./cloudinaryConfig');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');



// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: "books" },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

router.post('/post', verifyTokenAndAdmin, upload.single('imageFile'), async (req, res) => {
    const { title, description, price, pages, preview } = req.body;
    const imageFile = req.file;

    if (!imageFile || !title || !description || !price || !pages || !preview) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(imageFile.buffer, imageFile.originalname);
        console.log(imageUrl);

        // Create a new Ebook document
        const newBook = new Ebook({
            imageUrl,
            title,
            description,
            price,
            pages,
            preview,
        });

        // Save to MongoDB
        await newBook.save();

        res.status(201).json({ message: 'Ebook uploaded successfully', book: newBook });
    } catch (error) {
        console.error('Error saving ebook:', error);

        if (error.name === 'ValidationError') {
            // Extract validation error messages
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: 'Validation failed', messages: errors });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/download/:id', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'books', filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error during file download:", err);
            res.status(404).send('File not found!');
        }
    });
})
// GET ALL EBOOK
router.get("/", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const ebook = await Ebook.find();
        res.status(200).json(ebook);
    } catch (error) {
        res.status(500).json(error);
    }
});



// GET ONE EBOOK
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        res.status(200).json(ebook);
    } catch (error) {
        res.status(500).json(error);
    }
});



// UPDATE
router.put("/update/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const ebook = await Ebook.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true },
        );
        res.status(200).json(ebook);
    } catch (error) {
        res.status(500).json(error);
    }
});



// DELETE
router.delete("/delete/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Ebook.findByIdAndDelete(req.params.id);
        res.status(200).json("Data Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});



module.exports = router;
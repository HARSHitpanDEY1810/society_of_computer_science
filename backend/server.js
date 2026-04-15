const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `calendar-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDFs are allowed'));
    }
});

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `image-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadImg = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`)
});

const uploadPdf = multer({
    storage: pdfStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDFs are allowed'));
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cs_society";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- MODELS ---

const newsSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    url: { type: String, default: "#" },
    tag: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const linkSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const committeeMemberSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, default: "https://via.placeholder.com/300x400" },
    committeeType: { type: String, enum: ['Advisory', 'Executive'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const facultyProfileSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    qualification: { type: String, default: "" },
    areaOfInterest: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "https://via.placeholder.com/160x192" },
    createdAt: { type: Date, default: Date.now }
});

const constitutionSchema = new mongoose.Schema({
    url: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
    image: { type: String, default: "https://via.placeholder.com/800x400" },
    createdAt: { type: Date, default: Date.now }
});

const galleryItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: "General" },
    createdAt: { type: Date, default: Date.now }
});

const calendarSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const specialEventSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    tag: { type: String, default: "LIVE" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, default: "#" },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);
const Link = mongoose.model('Link', linkSchema);
const CommitteeMember = mongoose.model('CommitteeMember', committeeMemberSchema);
const FacultyProfile = mongoose.model('FacultyProfile', facultyProfileSchema);
const Constitution = mongoose.model('Constitution', constitutionSchema);
const Event = mongoose.model('Event', eventSchema);
const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
const Calendar = mongoose.model('Calendar', calendarSchema);
const SpecialEvent = mongoose.model('SpecialEvent', specialEventSchema);

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === `Bearer ${ADMIN_PASSWORD}`) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// --- API ROUTES ---

// Auth Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === ADMIN_PASSWORD) {
        res.json({ token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Academic Calendar
app.get('/api/calendar', async (req, res) => {
    try {
        const latest = await Calendar.findOne().sort({ uploadedAt: -1 });
        res.json(latest || { url: "#", message: "No calendar uploaded yet." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/calendar/upload', authMiddleware, upload.single('calendar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload a file" });

        // Delete old calendar file if it exists
        const oldCalendar = await Calendar.findOne().sort({ uploadedAt: -1 });
        if (oldCalendar && oldCalendar.filename) {
            const oldFilePath = path.join(uploadDir, oldCalendar.filename);
            if (fs.existsSync(oldFilePath)) {
                await fs.promises.unlink(oldFilePath);
            }
        }

        const newCalendar = new Calendar({
            filename: req.file.filename,
            url: `http://localhost:5000/uploads/${req.file.filename}`
        });

        await newCalendar.save();
        res.status(201).json(newCalendar);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic Image Upload
app.post('/api/upload/image', authMiddleware, uploadImg.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload an image" });
        res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic PDF Upload
app.post('/api/upload/pdf', authMiddleware, uploadPdf.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload a PDF file" });
        res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Manage Uploaded Files
app.get('/api/files', authMiddleware, async (req, res) => {
    try {
        const files = await fs.promises.readdir(uploadDir);
        const fileDetails = await Promise.all(files.map(async file => {
            const filePath = path.join(uploadDir, file);
            const stats = await fs.promises.stat(filePath);
            return {
                filename: file,
                url: `http://localhost:5000/uploads/${file}`,
                size: stats.size,
                createdAt: stats.mtime
            };
        }));
        // Sort by newest first
        fileDetails.sort((a, b) => b.createdAt - a.createdAt);
        res.json(fileDetails);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/files/:filename', authMiddleware, async (req, res) => {
    try {
        const filePath = path.join(uploadDir, req.params.filename);
        const fileUrl = `http://localhost:5000/uploads/${req.params.filename}`;

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);

            // Clean up database references
            await GalleryItem.deleteMany({ image: fileUrl });
            await Calendar.deleteMany({ url: fileUrl });

            // Clear URL fields
            await Constitution.updateMany({ url: fileUrl }, { $set: { url: "" } });
            await News.updateMany({ url: fileUrl }, { $set: { url: "" } });
            await Event.updateMany({ url: fileUrl }, { $set: { url: "" } });

            // Reset image fields to defaults
            await Event.updateMany({ image: fileUrl }, { $set: { image: "https://via.placeholder.com/800x400" } });
            await CommitteeMember.updateMany({ image: fileUrl }, { $set: { image: "https://via.placeholder.com/300x400" } });
            await FacultyProfile.updateMany({ image: fileUrl }, { $set: { image: "https://via.placeholder.com/160x192" } });

            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic helper for CRUD
const setupCRUD = (model, path, isProtected = false) => {
    app.get(path, async (req, res) => {
        try {
            const data = await model.find().sort({ createdAt: -1 });
            res.json(data);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    const handlers = [async (req, res) => {
        try {
            const newItem = new model({ ...req.body, id: Date.now() });
            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        } catch (err) { res.status(400).json({ error: err.message }); }
    }];

    if (isProtected) {
        app.post(path, authMiddleware, ...handlers);
        app.delete(`${path}/:id`, authMiddleware, async (req, res) => {
            try {
                const item = await model.findOne({ id: req.params.id });
                if (item) {
                    const fileUrl = item.image || item.url;
                    if (fileUrl && fileUrl.includes('/uploads/')) {
                        const filename = fileUrl.split('/').pop();
                        const filePath = require('path').join(uploadDir, filename);
                        if (fs.existsSync(filePath)) {
                            await fs.promises.unlink(filePath);
                        }
                    }
                }
                await model.findOneAndDelete({ id: req.params.id });
                res.json({ message: 'Deleted successfully' });
            } catch (err) { res.status(500).json({ error: err.message }); }
        });
    } else {
        app.post(path, ...handlers);
        app.delete(`${path}/:id`, async (req, res) => {
            try {
                const item = await model.findOne({ id: req.params.id });
                if (item) {
                    const fileUrl = item.image || item.url;
                    if (fileUrl && fileUrl.includes('/uploads/')) {
                        const filename = fileUrl.split('/').pop();
                        const filePath = require('path').join(uploadDir, filename);
                        if (fs.existsSync(filePath)) {
                            await fs.promises.unlink(filePath);
                        }
                    }
                }
                await model.findOneAndDelete({ id: req.params.id });
                res.json({ message: 'Deleted successfully' });
            } catch (err) { res.status(500).json({ error: err.message }); }
        });
    }
};

setupCRUD(News, '/api/news', true);
setupCRUD(Link, '/api/links', true);
setupCRUD(CommitteeMember, '/api/committee', true);
setupCRUD(FacultyProfile, '/api/faculty', true);
setupCRUD(Event, '/api/events', true);
setupCRUD(GalleryItem, '/api/gallery', true);

// Constitution specifically
app.get('/api/constitution', async (req, res) => {
    try {
        const doc = await Constitution.findOne();
        res.json(doc || { url: "" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/constitution', authMiddleware, async (req, res) => {
    try {
        let doc = await Constitution.findOne();
        if (doc) {
            // Check if there is an existing URL to delete
            if (doc.url && doc.url.includes('/uploads/')) {
                const oldFilename = doc.url.split('/').pop();
                const oldFilePath = path.join(uploadDir, oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    await fs.promises.unlink(oldFilePath);
                }
            }

            doc.url = req.body.url;
            doc.updatedAt = Date.now();
            await doc.save();
        } else {
            doc = new Constitution({ url: req.body.url });
            await doc.save();
        }
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Special Event specifically (Similar to Constitution, single document)
app.get('/api/special-event', async (req, res) => {
    try {
        const doc = await SpecialEvent.findOne();
        res.json(doc || null);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/special-event', authMiddleware, async (req, res) => {
    try {
        let doc = await SpecialEvent.findOne();
        if (doc) {
            doc.tag = req.body.tag;
            doc.title = req.body.title;
            doc.description = req.body.description;
            doc.url = req.body.url;
            doc.isActive = req.body.isActive;
            doc.updatedAt = Date.now();
            await doc.save();
        } else {
            doc = new SpecialEvent({
                id: Date.now(),
                ...req.body
            });
            await doc.save();
        }
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const [news, links, members, faculty] = await Promise.all([
            News.countDocuments(),
            Link.countDocuments(),
            CommitteeMember.countDocuments(),
            FacultyProfile.countDocuments()
        ]);
        res.json({
            totalFiles: 128 + news,
            activeLinks: links,
            committeeMembers: members,
            facultyMembers: faculty
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

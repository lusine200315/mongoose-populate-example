const express = require('express');
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const URI = process.env.URI;
const mongoose = require('mongoose');
mongoose.connect(URI);

const bookSchema = new mongoose.Schema({
    title: String,
    pages: Number,
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' }
});

const authorSchema = new mongoose.Schema({
    authorName: String,
    authorBirthDate: Date,
    authorNationality: {
        type: String,
        enum: ["American", "Japanese"]
    }
});

const Book = mongoose.model('Book', bookSchema);
const Author = mongoose.model('Author', authorSchema);

app.post('/books', async (req, res) => {
    const { title, pages, authorName, authorBirthDate, authorNationality } = req.body;

    if (!title || !pages || !authorName || !authorBirthDate || !authorNationality) {
        return res.status(400).json({ message: "Please send complete details" });
    };

    try {
        const author = new Author({ authorName, authorBirthDate, authorNationality });
        await author.save();

        const book = new Book({ title, pages, author_id: author._id });
        await book.save();

        res.status(201).json({ message: "Book created successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

app.get('/books/:pages', async (req, res) => {
    const { pages } = req.params;

    if (isNaN(pages)) {
        return res.status(400).json({ message: "Please send a valid number for pages" });
    }

    try {
        const book = await Book.find({pages});
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const result = await Book.findOne({pages}).populate('author_id');

        res.status(200).json({ result });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

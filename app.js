const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./router/auth')
const postmodel = require("./models/postmodel");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const { title } = require("process");
const router = express.Router();

const app = express();

// CORS Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'https://yashgupta06-2004.github.io'], // Allow requests from this origin
    methods: ['GET', 'POST','PUT','DELETE'], // Allowed methods
    credentials: true // Allow credentials if needed
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
// Auth routes
app.use('/api/auth', authRoutes);
app.use('/',router);

// MongoDB connection   7o3qbUnF29lYv8CY
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

    app.use(express.static('public'));

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,path.join(__dirname, '/public/Images'))
    },
    filename:(req,file,cb) => {
        cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage})

const verifyUser = (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json("the token is missing");
    } else {
        jwt.verify(token,process.env.SECERT_KEY, (err,decoded) => {
            if(err){
                return res.json ("the token is wrong")
            } else {
                console.log("Decoded token:")
                req.email = decoded.email;
                req.username = decoded.username;
                // req.password = decoded.password;
                next()
            }
        })
    }
}

// Test route
app.get("/", verifyUser, (req, res) => {
    // res.send("Yash Test");
        console.log("Username:", req.username, "Email:", req.email); // Log values
        return res.json({ username: req.username, email: req.email });
});

router.post('/create' , verifyUser , upload.single('file'), async (req,res) => {
    //const { title, desc , email} = req.body;
    // Handle the data as needed
   await postmodel.create({title:req.body.title,desc:req.body.desc,file:req.file.filename,email:req.body.email})
    .then(res => res.json(res))
    .catch(err => res.json(err)) 
    console.log(req.body)
})

router.get("/getposts" , (req,res) => {
    postmodel.find()
    .then(posts => res.json(posts))
    .catch(err => res.json(err));
})

router.get("/getpostbyid/:id" , (req,res) => {
    const id = req.params.id;
    postmodel.findById({_id:id})
    .then(post => res.json(post))
    .catch(err => console.log(err))
})

router.delete('/deletepost/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await postmodel.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/editpost/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const updatedPost = await postmodel.findByIdAndUpdate(id, {
            title: req.body.title,
            desc: req.body.desc,
        }, { new: true }); // Return the updated document
        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating post' });
    }
});


app.get("/logout", (req,res) => {
    res.clearCookie('token');
    console.log('token')
    return res.json("success");
})

const PORT = process.env.BASE_URL || 5000;
app.listen(process.env.BASE_URL, () => {
    console.log(`Server is running on port ${process.env.BASE_URL}`);
});

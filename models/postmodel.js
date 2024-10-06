const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    desc:{
        type:String,
    },
    file:{
        type:String,
    },
    email:{
        type:String,
    }
}, {timestamps:true});

const Postmodel = new mongoose.model('posts',PostSchema);
module.exports = Postmodel;
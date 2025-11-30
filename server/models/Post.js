import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author_id: {type: String, required: true, ref: 'User'},
    title: {type: String, default: ''},
    content: {type: String, required: true},
    image_url: {type: String, default: ''},
    likes: [{type: String, ref: 'User'}],
    comments: [{
        user_id: {type: String, ref: 'User'},
        text: {type: String},
        createdAt: {type: Date, default: Date.now}
    }],
    shares: {type: Number, default: 0},
    visibility: {type: String, enum: ['public', 'connections', 'private'], default: 'public'},
}, {collection: 'posts', timestamps: true});

const Post = mongoose.model('Post', postSchema, 'posts');

export default Post;

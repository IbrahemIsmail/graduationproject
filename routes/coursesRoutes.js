const express = require('express');
const mw = require('../middleware')
const { createPost, updatePost, deletePost, viewEdit, getPost, getPosts, createForum, searchPost} = require('../handlers/posts');
const router = express.Router();
const multer = require('multer');


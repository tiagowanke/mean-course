const path = require('path');
const express = require('express');

const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://tiagowanke:a5lGEEMaswsRKfGq@cluster0.52uta.mongodb.net/node-angular?retryWrites=true&w=majority')
.then(() => console.log('Connected to database!'))
.catch(() => console.error('Connection failed!'));

app.use(express.json());
app.use(express.urlencoded('body-parser'));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, PUT');
  next();
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

module.exports = app;

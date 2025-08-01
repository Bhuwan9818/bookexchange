require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const db = 'mongodb+srv://simmisingh981840:bhuwan.9818@cluster0.hpzxixu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
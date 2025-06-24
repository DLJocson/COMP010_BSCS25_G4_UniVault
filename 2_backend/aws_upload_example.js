// AWS S3 upload integration for Express backend
// 1. Install dependencies: npm install aws-sdk multer
// 2. Set AWS credentials and bucket in your .env file:
//    AWS_ACCESS_KEY_ID=your-access-key
//    AWS_SECRET_ACCESS_KEY=your-secret-key
//    AWS_REGION=your-region
//    AWS_S3_BUCKET=your-bucket-name

const AWS = require('aws-sdk');
const multer = require('multer');
const express = require('express');
const app = express();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const storage = multer.memoryStorage(); // Store file in memory for direct upload
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_'),
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({ filePath: data.Location }); // Public S3 URL
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Export or use this route in your main server.js

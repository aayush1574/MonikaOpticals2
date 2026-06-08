const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

const GLASSES_DIR = 'C:/Users/aayus/OneDrive/Desktop/Glasses';

app.use(cors());
app.use(express.static(__dirname)); // To serve bulk-upload.html
app.use('/glasses-images', express.static(GLASSES_DIR));

app.get('/api/scan', (req, res) => {
  try {
    const files = fs.readdirSync(GLASSES_DIR).filter(f => f.match(/^IMG_\d{8}_\d{6}.*\.(png|jpg|jpeg)$/i));
    
    // Parse times
    const parsedFiles = files.map(file => {
      const match = file.match(/^IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i);
      if (!match) return null;
      const date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
      return { filename: file, timestamp: date.getTime() };
    }).filter(Boolean);

    // Sort by time
    parsedFiles.sort((a, b) => a.timestamp - b.timestamp);

    // Group within 60 seconds
    const groups = [];
    let currentGroup = [];

    for (const file of parsedFiles) {
      if (currentGroup.length === 0) {
        currentGroup.push(file);
      } else {
        const lastFile = currentGroup[currentGroup.length - 1];
        if (file.timestamp - lastFile.timestamp <= 60000) { // 60 seconds
          currentGroup.push(file);
        } else {
          groups.push(currentGroup.map(f => f.filename));
          currentGroup = [file];
        }
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup.map(f => f.filename));
    }

    res.json({ ok: true, groups });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bulk Uploader running at http://localhost:${PORT}/bulk-upload.html`);
});

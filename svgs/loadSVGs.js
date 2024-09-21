const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import cors

const app = express();
const port = 3000;

// Use cors middleware
app.use(cors());

// Route to serve SVG files as text
app.get('/svg-files', (req, res) => {
    const svgDir = __dirname; // Directory where SVG files are located

    fs.readdir(svgDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }

        // Filter files to only include .svg
        const svgFiles = files.filter(file => path.extname(file) === '.svg');

        // Read each SVG file content and convert it to a string
        const svgPromises = svgFiles.map(file => {
            return new Promise((resolve, reject) => {
                fs.readFile(path.join(svgDir, file), 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ filename: file, content: data });
                    }
                });
            });
        });

        // Wait for all SVG file contents to be read
        Promise.all(svgPromises)
            .then(svgContents => {
                res.json(svgContents); // Send the list of SVG file contents as JSON
            })
            .catch(error => res.status(500).send('Error reading SVG files'));
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

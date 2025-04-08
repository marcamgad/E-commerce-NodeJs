const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

// Specify the path to the HTML file
const htmlPath = 'C:/Users/marc amgad/OneDrive/Desktop/New folder (3)/CV.html';
const pdfPath = 'C:/Users/marc amgad/OneDrive/Desktop/New folder (3)/CV.pdf';

// Read the HTML content
fs.readFile(htmlPath, 'utf8', (err, html) => {
  if (err) {
    console.error('Error reading HTML file:', err);
    return;
  }

  // Convert HTML to PDF
  pdf.create(html).toFile(pdfPath, (err, res) => {
    if (err) {
      console.error('Error converting to PDF:', err);
      return;
    }
    console.log('PDF created successfully:', res.filename);
  });
});

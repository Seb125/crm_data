// URL of the PDF file
const pdfUrl = 'Test_one_file.pdf';

// Asynchronous function to load and parse PDF
async function getPdfText(url) {
  // Fetch PDF document
  const pdfDoc = await pdfjsLib.getDocument(url).promise;

  // Initialize variable to store text content
  let pdfText = '';

  // Loop through each page to extract text
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    // Get page text content
    const page = await pdfDoc.getPage(pageNum);
    console.log("Pagenumber");
    const pageText = await page.getTextContent();
    
    // Concatenate text content from this page (assuming simple extraction)
    pageText.items.forEach(item => {
      pdfText += item.str + ' ';
    });
  }

  return pdfText;
}

// Usage example
getPdfText(pdfUrl).then(text => {
  console.log('Text content of PDF:', text);
  // Use the extracted text as needed
}).catch(err => {
  console.error('Error while loading PDF:', err);
});

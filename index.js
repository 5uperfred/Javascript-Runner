const express = require('express');
const { VM } = require('vm2');
const escapeStringRegexp = require('escape-string-regexp');

const app = express();

app.use(express.json());

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove null bytes
  input = input.replace(/\0/g, '');
  
  // Escape special characters
  input = escapeStringRegexp(input);
  
  // Truncate if too long (adjust max length as needed)
  const maxLength = 1000;
  if (input.length > maxLength) {
    input = input.slice(0, maxLength) + '...';
  }
  
  return input;
}

app.post('/api/run-js', (req, res) => {
  console.log('Received request:', req.body);

  let { text } = req.body;
  
  if (text === undefined || text === null) {
    console.log('No text provided');
    return res.status(400).json({ error: 'No text provided' });
  }

  const sanitizedText = sanitizeInput(text);
  console.log('Sanitized text:', sanitizedText);

  // Wrap the sanitized text in a safe JavaScript structure
  const code = `
    (function() {
      const input = "${sanitizedText}";
      
      // You can perform operations on the input here
      // For example, counting words:
      const wordCount = input.split(/\\s+/).filter(word => word.length > 0).length;
      
      return {
        originalText: input,
        wordCount: wordCount,
        characterCount: input.length,
        // Add more properties or transformations as needed
      };
    })();
  `;

  console.log('Executing code:', code);

  const vm = new VM({
    timeout: 5000,
    sandbox: {}
  });

  try {
    const result = vm.run(code);
    console.log('Execution result:', result);
    res.json({ result });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ error: 'Error processing text', details: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;

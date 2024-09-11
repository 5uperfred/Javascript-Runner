const express = require('express');
const { VM } = require('vm2');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the JavaScript Runner API. Send POST requests to /api/run-js to execute code.');
});

app.post('/api/run-js', (req, res) => {
  console.log('Received request:', req.body);  // Log the incoming request

  const { code } = req.body;
  
  if (!code) {
    console.log('No code provided');
    return res.status(400).json({ error: 'No code provided' });
  }

  console.log('Executing code:', code);  // Log the code being executed

  const vm = new VM({
    timeout: 5000,
    sandbox: {}
  });

  try {
    const result = vm.run(code);
    console.log('Execution result:', result);  // Log the execution result
    res.json({ result });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message, stack: err.stack });
});

// For local testing
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;

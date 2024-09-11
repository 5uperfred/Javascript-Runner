const express = require('express');
const { VM } = require('vm2');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the JavaScript Runner API. Send POST requests to /api/run-js to execute code.');
});

app.post('/api/run-js', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const vm = new VM({
    timeout: 5000,
    sandbox: {}
  });

  try {
    const result = vm.run(code);
    res.json({ result });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// For local testing
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;

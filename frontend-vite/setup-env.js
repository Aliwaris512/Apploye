const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env file already exists
if (!fs.existsSync(envPath)) {
  // Copy .env.example to .env
  try {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file from .env.example');
  } catch (error) {
    console.error('Error creating .env file:', error.message);
  }
} else {
  console.log('.env file already exists');
}

#!/usr/bin/env node

/**
 * Expo Generator CLI
 * Non-interactive code generator for Expo/React Native
 * Usage: node scripts/generators/index.js <type> [name] [...options]
 */

const path = require('path');
const fs = require('fs');

// Available generators
const generators = {
  authentication: require('./authentication'),
  api: require('./api-generator'),
  // Add more generators here
};

// Parse command line arguments
const [type, name, ...options] = process.argv.slice(2);

// Help message
function showHelp() {
  console.log(`
Expo Generator CLI

Usage:
  npm run gen <type> [name] [...options]

Available Generators:
  authentication    Generate complete authentication system
                   Example: npm run gen authentication

  api              Generate API service and types
                   Example: npm run gen api posts index show create update

Options:
  --help           Show this help message

Examples:
  npm run gen authentication
  npm run gen api posts index show create update
`);
  process.exit(0);
}

// Main execution
async function main() {
  // Show help if requested or no arguments
  if (!type || type === '--help' || type === '-h') {
    showHelp();
    return;
  }

  // Check if generator exists
  if (!generators[type]) {
    console.error(`❌ Error: Unknown generator type '${type}'`);
    console.log('\nAvailable generators:');
    Object.keys(generators).forEach(gen => {
      console.log(`  - ${gen}`);
    });
    process.exit(1);
  }

  // Run the generator
  try {
    await generators[type](name, options);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

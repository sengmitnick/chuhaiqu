const fs = require('fs');
const path = require('path');

/**
 * Generator Utils
 * Inspired by Rails generators
 * Provides reusable utilities for code generation
 */

// ==================== String Transformation Utilities ====================

/**
 * Convert to PascalCase: test_items -> TestItems, flow_entries -> FlowEntries
 */
function toPascalCase(word) {
  return word
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Convert to camelCase: test_items -> testItems, flow_entries -> flowEntries
 */
function toCamelCase(word) {
  const pascal = toPascalCase(word);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Singularize a word (basic English rules)
 */
function singularize(word) {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('ses')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

/**
 * Pluralize a word (basic English rules)
 */
function pluralize(word) {
  if (word.endsWith('s') && !word.endsWith('ss')) return word;
  if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

// ==================== ANSI color codes ====================
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Tracking
const generatedFiles = [];
const updatedFiles = [];

/**
 * Output colored message (like Rails `say`)
 */
function say(message, color = null) {
  if (color && COLORS[color]) {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  } else {
    console.log(message);
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

/**
 * Read template file
 */
function readTemplate(templateName, generatorName = null) {
  let templatePath;

  if (generatorName) {
    templatePath = path.join(__dirname, '../templates', generatorName, templateName);
  } else {
    templatePath = path.join(__dirname, '../templates', templateName);
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Create file with content (like Rails `create_file`)
 * @param {string} destination - Relative path from project root
 * @param {string} content - File content
 * @param {object} options - Options { force: boolean, skip: boolean }
 */
function createFile(destination, content, options = {}) {
  const fullPath = path.join(process.cwd(), destination);

  // Check if file exists
  if (fileExists(fullPath)) {
    if (options.skip) {
      say(`  skip  ${destination}`, 'yellow');
      return false;
    }

    if (!options.force) {
      say(`  conflict  ${destination}`, 'red');
      say(`    File already exists. Use { force: true } to overwrite.`, 'yellow');
      return false;
    }

    say(`  force  ${destination}`, 'yellow');
  } else {
    say(`  create  ${destination}`, 'green');
  }

  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf8');

  if (!generatedFiles.includes(destination)) {
    generatedFiles.push(destination);
  }

  return true;
}

/**
 * Copy file (like Rails `copy_file`)
 * @param {string} source - Template name or path
 * @param {string} destination - Relative path from project root
 * @param {object} options - Options { force: boolean, skip: boolean }
 */
function copyFile(source, destination, options = {}, generatorName = null) {
  const content = readTemplate(source, generatorName);
  return createFile(destination, content, options);
}

/**
 * Generate file from template with variable substitution (like Rails `template`)
 * @param {string} templateName - Template file name
 * @param {string} destination - Relative path from project root
 * @param {object} variables - Variables to substitute in template
 * @param {object} options - Options { force: boolean, skip: boolean }
 */
function template(templateName, destination, variables = {}, options = {}, generatorName = null) {
  let content = readTemplate(templateName, generatorName);

  // Simple variable substitution: <%= variable_name %>
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`<%=\\s*${key}\\s*%>`, 'g');
    content = content.replace(regex, variables[key]);
  });

  return createFile(destination, content, options);
}

/**
 * Inject content into file after a pattern (like Rails `inject_into_file`)
 * @param {string} filePath - Relative path from project root
 * @param {string} content - Content to inject
 * @param {object} options - Options { after: string|RegExp, before: string|RegExp, force: boolean }
 */
function injectIntoFile(filePath, content, options = {}) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fileExists(fullPath)) {
    say(`  error  ${filePath} not found`, 'red');
    return false;
  }

  let fileContent = fs.readFileSync(fullPath, 'utf8');

  // Check if content already exists
  if (fileContent.includes(content.trim())) {
    if (!options.force) {
      say(`  skip  ${filePath} (content already exists)`, 'yellow');
      return false;
    }
  }

  if (options.after) {
    let index = -1;
    let matchLength = 0;

    if (options.after instanceof RegExp) {
      // RegExp matching
      const match = fileContent.match(options.after);
      if (match) {
        index = match.index;
        matchLength = match[0].length;
      }
    } else {
      // String matching - match complete line if it's a line-based pattern
      const pattern = options.after;

      // If pattern looks like it should match a complete line (ends with newline or semicolon)
      if (pattern.endsWith('\n') || pattern.endsWith(';')) {
        index = fileContent.indexOf(pattern);
        matchLength = pattern.length;
      } else {
        // Try to match the pattern at end of line
        const lines = fileContent.split('\n');
        let currentPos = 0;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(pattern)) {
            // Found the line, position at end of this line
            index = currentPos + lines[i].length;
            matchLength = 0; // Will add newline after
            break;
          }
          currentPos += lines[i].length + 1; // +1 for newline
        }
      }
    }

    if (index === -1) {
      say(`  error  Pattern not found in ${filePath}: ${options.after}`, 'red');
      return false;
    }

    const insertPos = index + matchLength;
    fileContent = fileContent.slice(0, insertPos) + content + fileContent.slice(insertPos);
  } else if (options.before) {
    let index = -1;

    if (options.before instanceof RegExp) {
      const match = fileContent.match(options.before);
      if (match) {
        index = match.index;
      }
    } else {
      index = fileContent.indexOf(options.before);
    }

    if (index === -1) {
      say(`  error  Pattern not found in ${filePath}: ${options.before}`, 'red');
      return false;
    }

    fileContent = fileContent.slice(0, index) + content + fileContent.slice(index);
  } else {
    say(`  error  Must specify 'after' or 'before' option`, 'red');
    return false;
  }

  fs.writeFileSync(fullPath, fileContent, 'utf8');
  say(`  inject  ${filePath}`, 'green');

  if (!updatedFiles.includes(filePath)) {
    updatedFiles.push(filePath);
  }

  return true;
}

/**
 * Replace content in file using regex (like Rails `gsub_file`)
 * @param {string} filePath - Relative path from project root
 * @param {RegExp|string} pattern - Pattern to match
 * @param {string} replacement - Replacement string
 */
function gsubFile(filePath, pattern, replacement) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fileExists(fullPath)) {
    say(`  error  ${filePath} not found`, 'red');
    return false;
  }

  let fileContent = fs.readFileSync(fullPath, 'utf8');
  const newContent = fileContent.replace(pattern, replacement);

  if (fileContent === newContent) {
    say(`  skip  ${filePath} (no changes)`, 'yellow');
    return false;
  }

  fs.writeFileSync(fullPath, newContent, 'utf8');
  say(`  gsub  ${filePath}`, 'green');

  if (!updatedFiles.includes(filePath)) {
    updatedFiles.push(filePath);
  }

  return true;
}

/**
 * Append content to file (like Rails `append_to_file`)
 * @param {string} filePath - Relative path from project root
 * @param {string} content - Content to append
 */
function appendToFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fileExists(fullPath)) {
    say(`  error  ${filePath} not found`, 'red');
    return false;
  }

  let fileContent = fs.readFileSync(fullPath, 'utf8');

  // Check if content already exists
  if (fileContent.includes(content.trim())) {
    say(`  skip  ${filePath} (content already exists)`, 'yellow');
    return false;
  }

  fs.appendFileSync(fullPath, content, 'utf8');
  say(`  append  ${filePath}`, 'green');

  if (!updatedFiles.includes(filePath)) {
    updatedFiles.push(filePath);
  }

  return true;
}

/**
 * Remove file (like Rails `remove_file`)
 * @param {string} filePath - Relative path from project root
 */
function removeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fileExists(fullPath)) {
    say(`  skip  ${filePath} (doesn't exist)`, 'yellow');
    return false;
  }

  fs.unlinkSync(fullPath);
  say(`  remove  ${filePath}`, 'red');
  return true;
}

/**
 * Create empty directory (like Rails `empty_directory`)
 * @param {string} dirPath - Relative path from project root
 */
function emptyDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);

  if (fs.existsSync(fullPath)) {
    say(`  exist  ${dirPath}`, 'cyan');
    return false;
  }

  fs.mkdirSync(fullPath, { recursive: true });
  say(`  create  ${dirPath}`, 'green');
  return true;
}

/**
 * Get tracking data
 */
function getGeneratedFiles() {
  return [...generatedFiles];
}

function getUpdatedFiles() {
  return [...updatedFiles];
}

/**
 * Reset tracking
 */
function resetTracking() {
  generatedFiles.length = 0;
  updatedFiles.length = 0;
}

/**
 * Show generation summary
 */
function showSummary(options = {}) {
  const { title = 'Generation complete!', nextSteps = [] } = options;

  say('\n' + '='.repeat(70), 'green');
  say(`✅ ${title}`, 'green');
  say('='.repeat(70), 'green');

  if (generatedFiles.length > 0) {
    say('\n📁 Generated files:', 'green');
    generatedFiles.forEach(file => {
      say(`  ✓ ${file}`, 'cyan');
    });
  }

  if (updatedFiles.length > 0) {
    say('\n📝 Updated files:', 'green');
    updatedFiles.forEach(file => {
      say(`  ✓ ${file}`, 'cyan');
    });
  }

  say('\n📊 Summary:', 'green');
  say(`  Files created: ${generatedFiles.length}`);
  say(`  Files updated: ${updatedFiles.length}`);

  if (nextSteps.length > 0) {
    say('\n🎯 Next steps:', 'yellow');
    nextSteps.forEach((step, index) => {
      say(`  ${index + 1}. ${step}`);
    });
  }

  say('');
}

module.exports = {
  // String transformations
  toPascalCase,
  toCamelCase,
  singularize,
  pluralize,

  // Output
  say,

  // File operations
  fileExists,
  ensureDir,
  createFile,
  copyFile,
  template,
  removeFile,
  emptyDirectory,

  // File manipulation
  injectIntoFile,
  gsubFile,
  appendToFile,

  // Template reading
  readTemplate,

  // Tracking
  getGeneratedFiles,
  getUpdatedFiles,
  resetTracking,
  showSummary,

  // Colors (for custom say usage)
  COLORS,
};

const fs = require('fs');

function ensureDirectoryExistence(filePath) {
    if (!fs.existsSync(filePath)) {
        // Если директории нет, создаем ее
        fs.mkdirSync(filePath, { recursive: true });
    }
  }

  module.exports = { ensureDirectoryExistence }
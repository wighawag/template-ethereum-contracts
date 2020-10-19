#!/usr/bin/env node
const fs = require('fs-extra');

if (!fs.existsSync('.vscode/settings.json')) {
  fs.copyFileSync('.vscode/settings.json.default', '.vscode/settings.json');
}

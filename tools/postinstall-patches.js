const {set, cd, sed} = require('shelljs');
const path = require('path');

console.log('===== about to run the postinstall.js script     =====');
// fail on first error
set('-e');
// print commands as being executed
set('-v');
// jump to project root
cd(path.join(__dirname, '../'));


console.log('===== finished running the postinstall.js script =====');

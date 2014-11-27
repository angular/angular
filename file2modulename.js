function file2moduleName(filePath) {
  return filePath.replace(/\\/g, '/')
    // module name should be relative to `modules` and `tools` folder
    .replace(/.*\/modules\//, '')
    .replace(/.*\/tools\//, '')
    // module name should not include `src`, `test`, `lib`
    .replace(/\/src\//, '/')
    .replace(/\/lib\//, '/')
    // module name should not have a suffix
    .replace(/\.\w*$/, '');
}
if (typeof module !== 'undefined') {
  module.exports = file2moduleName;
}

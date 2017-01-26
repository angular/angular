module.exports = function getExampleFilename() {

  function getExampleFilenameImpl(relativePath) {
    return getExampleFilenameImpl.examplesFolder + relativePath;
  }

  getExampleFilenameImpl.examplesFolder = '@angular/examples/';
  return getExampleFilenameImpl;
};

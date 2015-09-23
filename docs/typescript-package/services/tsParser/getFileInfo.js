var path = require('canonical-path');
var ts = require('typescript');

module.exports = function getFileInfo(log) {

  return function (symbol, basePath) {
    if (!symbol.declarations) {
      console.log("ouch", symbol);
    }
    var fileName = ts.getSourceFileOfNode(symbol.declarations[0]).fileName;

    var file = path.resolve(basePath, fileName);
    var fileInfo = {
      filePath: file,
      baseName: path.basename(file, path.extname(file)),
      extension: path.extname(file).replace(/^\./, ''),
      basePath: basePath,
      relativePath: fileName,
      projectRelativePath: fileName
    };
    return fileInfo;
  };
};

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var traceur = require('../../transpiler');
var walkSync = require('walk-sync');
var Writer = require('broccoli-writer');
var xtend = require('xtend');

class TraceurFilter extends Writer {
  constructor(private inputTree, private options = {}) {}

  write(readTree, destDir) {
    return readTree(this.inputTree)
      .then(srcDir => {
        walkSync(srcDir)
          .filter(filepath => {
            var extension = path.extname(filepath).toLowerCase();
            return extension === '.js' || extension === '.es6';
          })
          .map(filepath => {
            var options = xtend({filename: filepath}, this.options);

            var fsOpts = {encoding: 'utf-8'};
            var sourcecode = fs.readFileSync(path.join(srcDir, filepath), fsOpts);

            var result = traceur.compile(options, filepath, sourcecode);

            result.js = result.js + '\n//# sourceMappingURL=./' + path.basename(filepath).replace(/\.\w+$/, '.map');

            var destFilepath = filepath.replace(/\.\w+$/, '.es6');
            var destFile = path.join(destDir, destFilepath);
            fse.mkdirsSync(path.dirname(destFile));
            var destMap = path.join(destDir, filepath + '.map');


            fs.writeFileSync(destFile, result.js, fsOpts);
            result.sourceMap.file = destFilepath;
            fs.writeFileSync(destMap, JSON.stringify(result.sourceMap), fsOpts);
          });
      });
  }
}

module.exports = TraceurFilter;

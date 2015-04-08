var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var traceur = require('../../transpiler');
var walkSync = require('walk-sync');
var Writer = require('broccoli-writer');
var xtend = require('xtend');

class TraceurFilter extends Writer {
  constructor(private inputTree, private destExtension: string = '.js', private options = {}) {}

  write(readTree, destDir) {
    return readTree(this.inputTree)
        .then(srcDir => {
          walkSync(srcDir)
              .filter(filepath =>
                      {
                        var extension = path.extname(filepath).toLowerCase();
                        return extension === '.js' || extension === '.es6';
                      })
              .map(filepath => {
                var options = xtend({filename: filepath}, this.options);

                var fsOpts = {encoding: 'utf-8'};
                var sourcecode = fs.readFileSync(path.join(srcDir, filepath), fsOpts);

                var result = traceur.compile(options, filepath, sourcecode);

                // TODO: we should fix the sourceMappingURL written by Traceur instead of overriding
                // (but we might switch to typescript first)
                result.js = result.js + '\n//# sourceMappingURL=./' +
                            path.basename(filepath).replace(/\.es6$/, '') +
                            (this.destExtension === '.js' ? '.js.map' : '.map');

                var destFilepath = filepath.replace(/\.\w+$/, this.destExtension);
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

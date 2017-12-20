import {writeFileSync} from 'fs';
import {basename} from 'path';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');

/** Minifies a JavaScript file by using UglifyJS2. Also writes sourcemaps to the output. */
export function uglifyJsFile(inputPath: string, outputPath: string) {
  const sourceMapPath = `${outputPath}.map`;

  const result = uglify.minify(inputPath, {
    inSourceMap: `${inputPath}.map`,
    outSourceMap: basename(sourceMapPath),
    output: {
      comments: 'some'
    }
  });

  writeFileSync(outputPath, result.code);
  writeFileSync(sourceMapPath, result.map);
}

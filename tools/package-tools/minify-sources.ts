import {writeFileSync} from 'fs';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');

/** Minifies a JavaScript file by using UglifyJS2. Also writes sourcemaps to the output. */
export function uglifyJsFile(inputPath: string, outputPath: string) {
  const sourcemapOut = `${outputPath}.map`;
  const result = uglify.minify(inputPath, {
    outSourceMap: sourcemapOut,
    output: {
      comments: 'some'
    }
  });

  writeFileSync(outputPath, result.code);
  writeFileSync(sourcemapOut, result.map);
}

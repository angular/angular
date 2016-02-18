/**
 * Must be run after build.js.cjs has laid out angular2 and its tests in the dist/js/cjs folder.
 */
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as linker from '../linker';

var tmpdir = process.argv.slice(2)[0];

// These sources are require'd from the node_modules that got symlink'ed into dist/js/cjs
linker.main({outDir: tmpdir, componentSources: [
  "angular2/test/integration/basic",
  "angular2/test/integration/multiple_components"
]});

fs.writeFileSync(path.join(tmpdir, 'tsconfig.json'), `
{
    "compilerOptions": {
        "target": "es6",
        "baseUrl": ".",
        "rootDirs": [".", "${process.cwd()}/dist/js/cjs"],
        "paths": {
          "angular2/*": ["${process.cwd()}/dist/js/cjs/angular2/*"],
          "rxjs/*": ["${process.cwd()}/node_modules/rxjs/*"]
        }
    }
}`, {encoding: 'utf-8'});

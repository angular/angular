import {readFileSync, writeFileSync} from 'fs';

let code = readFileSync('./node_modules/@angular-devkit/build-angular/src/babel/presets/application.js', 'utf8');
code = code.replace(/^(\s+)(plugins.push\(require\('@babel\/plugin-transform-async-to-generator'\)\.default, require\('@babel\/plugin-proposal-async-generator-functions'\)\.default\);)/m, '$1// $2');
writeFileSync('./node_modules/@angular-devkit/build-angular/src/babel/presets/application.js', code);
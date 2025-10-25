import {readFileSync} from 'fs';
const banner = readFileSync('vscode-ng-language-service/server/banner.js', 'utf8');

export default {
  banner: {js: banner},
  mainFields: ['module', 'main'],
  // Workaround for https://github.com/aspect-build/rules_esbuild/issues/58
  resolveExtensions: ['.js'],
};

const fs = require('fs');
const path = require('path');

const packageJson = require('@angular/common/package.json');
const localesFolder = packageJson['locales'];
if (!localesFolder) {
  throw new Error(`@angular/common/package.json does not contain 'locales' entry.`)
}
const enLocalePath = `@angular/common/${localesFolder}/en`;
try {
  require.resolve(enLocalePath);
} catch (err) {
  throw new Error(`@angular/common does not contain 'en' locale in ${enLocalePath}.`)
}

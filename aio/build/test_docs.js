const execSync = require('child_process').execSync;
execSync(
  'node ../dist/tools/cjs-jasmine/index-tools ../../transforms/**/*.spec.js',
  {stdio: ['inherit', 'inherit', 'inherit']}
);

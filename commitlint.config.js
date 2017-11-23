const glob = require('glob');

const scopes = ['aio', 'changelog', 'packaging']
  .concat(getPackages());

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'scope-enum': [
      2, 'always',
      scopes
    ]
  }
};

function getPackages() {
  return glob
    .sync('packages/*/package.json')
    .map(manifest => require(`./${manifest}`).name)
    .map(name => {
      const f = name.split('/');
      return f[f.length - 1];
    });
}

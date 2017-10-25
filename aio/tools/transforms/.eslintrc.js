module.exports = {
  'env': {
    'es6': true,
    'jasmine': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:jasmine/recommended'
  ],
  'plugins': [
    'jasmine'
  ],
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'jasmine/new-line-before-expect': 0
  }
};

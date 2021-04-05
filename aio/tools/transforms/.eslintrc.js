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
    'linebreak-style': ['error', 'unix'],
    'no-prototype-builtins': ['off'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'jasmine/new-line-before-expect': ['off'],
  }
};

module.exports = {
  'root': true,
  'env': {
    'es6': true,
    'jasmine': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:jasmine/recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 2020,
  },
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

module.exports = {
  'globals': {'describe': true, 'beforeEach': true, 'it': true, 'expect': true},
  'env': {'node': true},
  'extends': 'eslint:recommended',
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};
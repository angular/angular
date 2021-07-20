module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:jasmine/recommended',
  ],
  env: {
    es2020: true,
    jasmine: true,
    node: true,
  },
  plugins: [
    'jasmine',
  ],
  rules: {
    'indent': ['error', 2, {
      'CallExpression': {
        'arguments': 2,
      },
      'FunctionDeclaration': {
        'parameters': 2,
      },
      'FunctionExpression': {
        'parameters': 2,
      },
      'MemberExpression': 2,
    }],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['error', 100],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'jasmine/new-line-before-expect': ['off'],
  },
};

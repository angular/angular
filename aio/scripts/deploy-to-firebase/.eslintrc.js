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
  parserOptions: {
    sourceType: 'module',
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
      'SwitchCase': 1,
    }],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['error', {'code': 100, 'ignoreUrls': true}],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'jasmine/new-line-before-expect': ['off'],
    'jasmine/no-spec-dupes': ['warn', 'branch'],
  },
};

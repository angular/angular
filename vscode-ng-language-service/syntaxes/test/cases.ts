export const cases = [
  {
    'name': 'inline template',
    'scopeName': 'inline-template.ng',
    'grammarFiles': [
      'syntaxes/inline-template.json',
      'syntaxes/template.json',
      'syntaxes/expression.json',
    ],
    'testFile': 'syntaxes/test/data/inline-template.ts',
  },
  {
    'name': 'inline styles',
    'scopeName': 'inline-styles.ng',
    'grammarFiles': ['syntaxes/inline-styles.json'],
    'testFile': 'syntaxes/test/data/inline-styles.ts',
  },
  {
    'name': 'template syntax',
    'scopeName': 'template.ng',
    'grammarFiles': ['syntaxes/template.json', 'syntaxes/expression.json'],
    'testFile': 'syntaxes/test/data/template.html',
  },
  {
    'name': 'block syntax',
    'scopeName': 'template.blocks.ng',
    'grammarFiles': [
      'syntaxes/template-blocks.json',
      'syntaxes/expression.json',
      'syntaxes/template.json',
    ],
    'testFile': 'syntaxes/test/data/template-blocks.html',
  },
  {
    'name': 'tag syntax',
    'scopeName': 'template.tag.ng',
    'grammarFiles': [
      'syntaxes/template-tag.json',
      'syntaxes/expression.json',
      'syntaxes/template.json',
    ],
    'testFile': 'syntaxes/test/data/template-tag.html',
  },
  {
    'name': 'expression syntax',
    'scopeName': 'template.ng',
    'grammarFiles': ['syntaxes/template.json', 'syntaxes/expression.json'],
    'testFile': 'syntaxes/test/data/expression.html',
  },
  {
    'name': 'let syntax',
    'scopeName': 'template.let.ng',
    'grammarFiles': ['syntaxes/let-declaration.json', 'syntaxes/expression.json'],
    'testFile': 'syntaxes/test/data/let-declaration.html',
  },
  {
    'name': 'host object literal',
    'scopeName': 'host-object-literal.ng',
    'grammarFiles': [
      'syntaxes/host-object-literal.json',
      'syntaxes/template.json',
      'syntaxes/expression.json',
    ],
    'testFile': 'syntaxes/test/data/host-object-literal.ts',
  },
];

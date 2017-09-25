var rules = {
  environment_import: {
    from: `import { environment } from './environments/environment';`,
    to: ''
  },
  environment_check: {
    from: /if \(environment\.production\)\s*{\n*\s*enableProdMode\(\);\s*}/g,
    to: ''
  }
};

var rulesToApply = [
  {
    pattern: 'environment_import'
  },
  {
    pattern: 'environment_check'
  }
];

module.exports = {
  rules: rules,
  rulesToApply: rulesToApply
};

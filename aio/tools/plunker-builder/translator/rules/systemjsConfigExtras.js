var rules = {
  system_extra_main: {
    from: /main:\s*[\'|\"]index.js[\'|\"]/g,
    to:   'main: "index.ts"'
  },
  system_extra_defaultExtension: {
    from: /defaultExtension:\s*[\'|\"]js[\'|\"]/g,
    to:   'defaultExtension: "ts"'
  }
};

var rulesToApply = [
  {
    pattern: 'system_extra_main'
  },
  {
    pattern: 'system_extra_defaultExtension'
  }
];

module.exports = {
  rules: rules,
  rulesToApply: rulesToApply
};

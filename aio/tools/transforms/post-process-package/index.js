var Package = require('dgeni').Package;
var base = require('dgeni-packages/base');

module.exports = new Package('post-process-package', [base])
  .processor(require('./processors/post-process-html'));

var Package = require('dgeni').Package;

module.exports = new Package('target', [require('dgeni-packages/jsdoc')])

                     .factory(require('./services/targetEnvironments'))
                     .factory(require('./inline-tag-defs/target'))

                     .config(function(inlineTagProcessor, targetInlineTagDef) {
                       inlineTagProcessor.inlineTagDefinitions.push(targetInlineTagDef);
                     });

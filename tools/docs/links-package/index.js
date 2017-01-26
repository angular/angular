var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');

module.exports =
    new Package('links', [jsdocPackage])

        .factory(require('./inline-tag-defs/link'))
        .factory(require('./services/getAliases'))
        .factory(require('./services/getDocFromAlias'))
        .factory(require('./services/getLinkInfo'))
        .factory(require('./services/moduleScopeLinkDisambiguator'))
        .factory(require('./services/deprecatedDocsLinkDisambiguator'))

        .config(function(inlineTagProcessor, linkInlineTagDef) {
          inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
        })

        .config(function(
            getLinkInfo, moduleScopeLinkDisambiguator, deprecatedDocsLinkDisambiguator) {
          getLinkInfo.disambiguators.push(moduleScopeLinkDisambiguator);
          getLinkInfo.disambiguators.push(deprecatedDocsLinkDisambiguator);
        });

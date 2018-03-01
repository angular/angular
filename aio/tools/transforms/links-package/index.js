var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');

module.exports =
    new Package('links', [jsdocPackage])

        .factory(require('./inline-tag-defs/link'))
        .factory(require('./services/getAliases'))
        .factory(require('./services/getDocFromAlias'))
        .factory(require('./services/getLinkInfo'))
        .factory(require('./services/disambiguators/disambiguateByDeprecated'))
        .factory(require('./services/disambiguators/disambiguateByModule'))

        .config(function(inlineTagProcessor, linkInlineTagDef) {
          inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
        })

        .config(function(getDocFromAlias, disambiguateByDeprecated, disambiguateByModule) {
          getDocFromAlias.disambiguators = [
            disambiguateByDeprecated,
            disambiguateByModule
          ];
        });

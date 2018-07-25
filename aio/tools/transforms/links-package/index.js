var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');

module.exports =
    new Package('links', [jsdocPackage])

        .factory(require('./inline-tag-defs/link'))
        .factory(require('./services/getAliases'))
        .factory(require('./services/getDocFromAlias'))
        .factory(require('./services/getLinkInfo'))
        .factory(require('./services/disambiguators/disambiguateByContainer'))
        .factory(require('./services/disambiguators/disambiguateByDeprecated'))
        .factory(require('./services/disambiguators/disambiguateByModule'))
        .factory(require('./services/disambiguators/disambiguateByNonMember'))

        .config(function(inlineTagProcessor, linkInlineTagDef) {
          inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
        })

        .config(function(getDocFromAlias, disambiguateByContainer, disambiguateByDeprecated, disambiguateByModule, disambiguateByNonMember) {
          getDocFromAlias.disambiguators = [
            disambiguateByContainer,
            disambiguateByDeprecated,
            disambiguateByModule,
            disambiguateByNonMember,
          ];
        });

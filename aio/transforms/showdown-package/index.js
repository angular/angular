var Package = require('dgeni').Package;

/**
 * @dgPackage showdown
 * @description Overrides the renderMarkdown service with an implementation based on Rho
 */
module.exports = new Package('showdown', ['nunjucks'])

                     .factory(require('./services/renderMarkdown'));

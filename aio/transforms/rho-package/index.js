var Package = require('dgeni').Package;

/**
 * @dgPackage rho
 * @description Overrides the renderMarkdown service with an implementation based on Rho
 */
module.exports = new Package('rho', ['nunjucks'])

                     .factory(require('./services/renderMarkdown'));

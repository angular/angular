var Package = require('dgeni').Package;

/**
 * @dgPackage remark
 * @description Overrides the renderMarkdown service with an implementation based on remark
 */
module.exports = new Package('remark', ['nunjucks'])

                     .factory(require('./services/renderMarkdown'));

var entities = require('entities');

/**
 * @dgService exampleInlineTagDef
 * @description
 * Process inline example tags (of the form {@example relativePath region -header='some header'
 * -stylePattern='{some style pattern}' }),
 * replacing them with code from a shredded file
 * Examples:
 * {@example core/application_spec.ts hello-app -header='Sample component' }
 * {@example core/application_spec.ts -region=hello-app -header='Sample component' }
 * @kind function
 */
module.exports = function exampleInlineTagDef(parseArgString, createDocMessage, getExampleRegion) {
  return {
    name: 'example',
    description:
        'Process inline example tags (of the form {@example some/uri some-region Some header}), replacing them with HTML anchors',


    handler: function(doc, tagName, tagDescription) {
      var tagArgs = parseArgString(entities.decodeHTML(tagDescription));
      var unnamedArgs = tagArgs._;
      var relativePath = unnamedArgs[0];
      var regionName = tagArgs.region || (unnamedArgs.length > 1 ? unnamedArgs[1] : '');
      if (regionName === '\'\'') regionName = '';
      var header = tagArgs.header || (unnamedArgs.length > 2 ? unnamedArgs.slice(2).join(' ') : null);
      var linenums = tagArgs.linenums;
      // var stylePattern = tagArgs.stylePattern;  // TODO: not yet implemented here

      const sourceCode = getExampleRegion(doc, relativePath, regionName);

      const attributes = [];
      if (relativePath) attributes.push(` path="${relativePath}"`);
      if (regionName) attributes.push(` region="${regionName}"`);
      if (header) attributes.push(` header="${header}"`);
      if (linenums !== undefined) attributes.push(` linenums="${linenums}"`);

      // Preserve the no-longer-supported `title` attribute,
      // in order to throw an appropriate error in `renderExamples` later.
      if (tagArgs.title) attributes.push(` title="${tagArgs.title}"`);

      return '<code-example' + attributes.join('') + '>\n' + sourceCode + '\n</code-example>';
    }
  };
};


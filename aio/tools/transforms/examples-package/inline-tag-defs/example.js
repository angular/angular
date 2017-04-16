var entities = require('entities');

/**
 * @dgService exampleInlineTagDef
 * @description
 * Process inline example tags (of the form {@example relativePath region -title='some title'
 * -stylePattern='{some style pattern}' }),
 * replacing them with code from a shredded file
 * Examples:
 * {@example core/application_spec.ts hello-app -title='Sample component' }
 * {@example core/application_spec.ts -region=hello-app -title='Sample component' }
 * @kind function
 */
module.exports = function exampleInlineTagDef(parseArgString, createDocMessage, getExampleRegion) {
  return {
    name: 'example',
    description:
        'Process inline example tags (of the form {@example some/uri Some Title}), replacing them with HTML anchors',


    handler: function(doc, tagName, tagDescription) {
      var tagArgs = parseArgString(entities.decodeHTML(tagDescription));
      var unnamedArgs = tagArgs._;
      var relativePath = unnamedArgs[0];
      var regionName = tagArgs.region || (unnamedArgs.length > 1 ? unnamedArgs[1] : '');
      if (regionName === '\'\'') regionName = '';
      var title = tagArgs.title || (unnamedArgs.length > 2 ? unnamedArgs.slice(2).join(' ') : null);
      var linenums = tagArgs.linenums;
      // var stylePattern = tagArgs.stylePattern;  // TODO: not yet implemented here

      const sourceCode = getExampleRegion(doc, relativePath, regionName);

      const attributes = [];
      if (title) attributes.push(` title="${title}"`);
      if (linenums !== undefined) attributes.push(` linenums="${linenums}"`);

      return '<code-example' + attributes.join('') + '>\n' + sourceCode + '\n</code-example>';
    }
  };
};


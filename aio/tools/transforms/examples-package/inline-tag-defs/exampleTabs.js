var path = require('canonical-path');
var fs = require('fs');

/**
 * @dgService exampleTabsInlineTagDef
 * @description
 * Process inline example tags (of the form {@example relativePath region -title='some title'
 * -stylePattern='{some style pattern}' }),
 * replacing them with a jade makeExample mixin call.
 * Examples:
 * {@exampleTabs core/application_spec.ts,core/application_spec.ts "hello-app,hello-app2"
 * -titles="Hello app1, Hello app2" }
 * {@exampleTabs core/application_spec.ts,core/application_spec.ts regions="hello-app,hello-app2"
 * -titles="Hello app1, Hello app2" }
 * @kind function
 */
module.exports = function exampleTabsInlineTagDef(getLinkInfo, parseArgString) {
  return {
    name: 'exampleTabs',
    description:
        'Process inline example tags (of the form {@example some/uri Some Title}), replacing them with HTML anchors',
    handler: function(doc, tagName, tagDescription) {

      var tagArgs = parseArgString(tagDescription);
      var unnamedArgs = tagArgs._;
      var relativePaths = unnamedArgs[0].split(',');
      var regions = tagArgs.regions || (unnamedArgs.length > 1 ? unnamedArgs[1] : null);
      var titles = tagArgs.titles || (unnamedArgs.length > 2 ? unnamedArgs[2] : null);
      if (regions) {
        regions = regions.split(',');
      }

      // TODO: not yet implemented here
      // var stylePatterns = tagArgs.stylePattern;

      var mixinPaths = relativePaths.map(function(relativePath, ix) {
        // eslint-disable-next-line no-undef
        var fragFileName = getApiFragmentFileName(relativePath, regions && regions[ix]);
        if (!fs.existsSync(fragFileName)) {
          // TODO: log.warn(createDocMessage('Invalid example (unable to locate fragment file: ' +
          // quote(fragFileName) + ")", doc));
        }
        return path.join('_api', relativePath);
      });

      var comma = ', ';
      var pathsArg = quote(mixinPaths.join(','));
      var regionsArg = regions ? quote(regions.join(',')) : 'null';
      var titlesArg = titles ? quote(titles) : 'null';
      var res = ['+makeTabs(', pathsArg, comma, regionsArg, comma, titlesArg, ')'].join('');
      return res;
    }

  };
};

function quote(str) {
  if (str == null || str.length === 0) return str;
  str = str.replace('\'', '\'\'');
  return '\'' + str + '\'';
}

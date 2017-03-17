var templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*)/gm;
var stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
var stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

module.exports.translate = function(load){

  var url = new URL(load.address);

  var basePathParts = url.pathname.split('/');

  if (url.href.indexOf('plnkr') != -1) {
    basePathParts.shift();
    basePathParts.shift();
  }

  basePathParts.pop();
  var basePath = basePathParts.join('/');
  load.source = load.source
    .replace(templateUrlRegex, function(match, quote, url){
      let resolvedUrl = url;

      if (url.startsWith('.')) {
        resolvedUrl = basePath + url.substr(1);
      }

      return `templateUrl: '${resolvedUrl}'`;
    })
    .replace(stylesRegex, function(match, relativeUrls) {
      var urls = [];

      while ((match = stringRegex.exec(relativeUrls)) !== null) {
        if (match[2].startsWith('.')) {
          urls.push(`'${basePath.substr(1)}${match[2].substr(1)}'`);
        } else {
          urls.push(`'${match[2]}'`);
        }
      }

      return "styleUrls: [" + urls.join(', ') + "]";
    });

  return load;
};

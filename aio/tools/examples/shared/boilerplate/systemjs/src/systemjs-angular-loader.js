var templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*)/gm;
var stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
var stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

module.exports.translate = function(load){
  if (load.source.indexOf('moduleId') != -1) return load;

  var url = document.createElement('a');
  url.href = load.address;

  var basePathParts = url.pathname.split('/');

  basePathParts.pop();
  var basePath = basePathParts.join('/');

  var baseHref = document.createElement('a');
  baseHref.href = this.baseURL;
  baseHref = baseHref.pathname;

  if (!baseHref.startsWith('/base/')) { // it is not karma
    basePath = basePath.replace(baseHref, '');
  }

  load.source = load.source
    .replace(templateUrlRegex, function(match, quote, url){
      var resolvedUrl = url;

      if (url.startsWith('.')) {
        resolvedUrl = basePath + url.slice(1);
      }

      return 'templateUrl: "' + resolvedUrl + '"';
    })
    .replace(stylesRegex, function(match, relativeUrls) {
      var urls = [];

      while ((match = stringRegex.exec(relativeUrls)) !== null) {
        if (match[2].startsWith('.')) {
          urls.push('"' + basePath + match[2].slice(1) + '"');
        } else {
          urls.push('"' + match[2] + '"');
        }
      }

      return "styleUrls: [" + urls.join(', ') + "]";
    });

  return load;
};

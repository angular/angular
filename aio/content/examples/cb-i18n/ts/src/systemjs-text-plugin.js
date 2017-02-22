// #docregion
/*
  SystemJS Text plugin from
  https://github.com/systemjs/plugin-text/blob/master/text.js
*/
exports.translate = function(load) {
  if (this.builder && this.transpiler) {
    load.metadata.format = 'esm';
    return 'exp' + 'ort var __useDefault = true; exp' + 'ort default ' + JSON.stringify(load.source) + ';';
  }

  load.metadata.format = 'amd';
  return 'def' + 'ine(function() {\nreturn ' + JSON.stringify(load.source) + ';\n});';
}

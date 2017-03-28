var PlunkerBuilder = require('./builder');

function buildPlunkers(basePath, destPath, options = {}) {
  configureBuilder(options);
  var builder = new PlunkerBuilder(basePath, destPath, options);
  builder.buildPlunkers();
}

function configureBuilder(options) {
  options.addField = addField;
  options.plunkerFileName = 'eplnkr';
  options.url = 'https://embed.plnkr.co?show=preview';
  options.writeNoLink = false;
  options.embedded = true;
  options.extraData = extraData;
}

function extraData(postData, config) {
  postData['source[type]'] = config.description || 'Angular example';
  postData['source[url]'] = 'https://angular.io'
}

function addField(postData, name, content) {
  var encoding = 'utf8';
  if (name.split('.').pop() === 'png') {
    encoding = 'base64';
  }
  postData[`entries[${name}][content]`] = content;
  postData[`entries[${name}][encoding]`] = encoding;
}

module.exports = {
  buildPlunkers: buildPlunkers
};

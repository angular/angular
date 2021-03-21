module.exports = function() {
  return {
    name: 'elementAttribute',
    docProperty: 'attributes',
    multi: true,
    transforms(doc, tag, value) {
      const startOfDescription = value.indexOf('\n');
      const name = value.substring(0, startOfDescription).trim();
      const description = value.substring(startOfDescription).trim();
      return {name, description};
    }
  };
};

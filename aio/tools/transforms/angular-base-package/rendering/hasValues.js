module.exports = function hasValues() {
  return {
    name: 'hasValues',
    process: function(list, property) {
      if (!list || !Array.isArray(list)) return false;
      return list.some(item => readProperty(item, property.split('.'), 0));
    }
  };
};

// Read deeply into an object via a collection of property segments
// E.g. if `obj = { a: { b: { c: 10 }}}` then `readProperty(obj, ['a', 'b', 'c'], 0)` will return `10`;
function readProperty(obj, propertySegments, index) {
  const value = obj[propertySegments[index]];
  return index < (propertySegments.length - 1) ? readProperty(value, propertySegments, index + 1) : value;
}

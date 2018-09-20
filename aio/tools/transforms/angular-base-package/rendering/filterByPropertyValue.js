module.exports = function filterBy() {
  return {
    name: 'filterByPropertyValue',
    process: function(list, property, value) {
      if (!list) return list;
      const values = Array.isArray(value) ? value : [value];
      return list.filter(item => values.some(value => compare(item[property], value)));
    }
  };
};

function compare(actual, expected) {
  return expected instanceof(RegExp) ? expected.test(actual) : actual === expected;
}
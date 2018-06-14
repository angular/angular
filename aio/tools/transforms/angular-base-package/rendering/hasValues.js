module.exports = function hasValues() {
  return {
    name: 'hasValues',
    process: function(list, property) {
      if (!list || !Array.isArray(list)) return false;
      return list.some(item => item[property]);
    }
  };
};
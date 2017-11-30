module.exports = function filterBy() {
  return {
    name: 'filterByPropertyValue',
    process: function(list, property, value) {
      if (!list) return list;
      return list.filter(item => item[property] === value);
    }
  };
};
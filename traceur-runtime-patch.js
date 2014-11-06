(function(type) {
  Object.keys(type).forEach(function(name) {
    type[name].__assertName = name;
  });
})(window.$traceurRuntime.type);


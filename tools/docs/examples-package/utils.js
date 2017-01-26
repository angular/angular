module.exports = {
  mapObject(obj, mapper) {
    const mappedObj = {};
    Object.keys(obj).forEach(key => { mappedObj[key] = mapper(key, obj[key]); });
    return mappedObj;
  }
};
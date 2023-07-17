
function parseCodeName(codeName) {
  var parts = [];
  var currentPart;

  codeName.split('.').forEach(function(part) {
    var subParts = part.split(':');

    var name = subParts.pop();
    var modifier = subParts.pop();

    if (!modifier && currentPart) {
      currentPart.name += '.' + name;
    } else {
      currentPart = {name: name, modifier: modifier};
      parts.push(currentPart);
    }
  });
  return parts;
}

/**
 * @dgService getAliases
 * @description
 * Get a list of all the aliases that can be made from the doc
 * @param  {Object} doc A doc from which to extract aliases
 * @return {Array}      A collection of aliases
 */
module.exports = function getAliases() {

  return function(doc) {

    var codeNameParts = parseCodeName(doc.id);

    var methodName;
    var aliases = [];
    // Add the last part to the list of aliases
    var part = codeNameParts.pop();

    // If the name contains a # then it is a member and that should be included in the aliases
    if (part.name.indexOf('#') !== -1) {
      methodName = part.name.split('#')[1];
    }
    // Add the part name and modifier, if provided
    aliases.push(part.name);
    if (part.modifier) {
      aliases.push(part.modifier + ':' + part.name);
    }

    // Continue popping off the parts of the codeName and work forward collecting up each alias
    aliases = codeNameParts.reduceRight(function(aliases, part) {

      // Add this part to each of the aliases we have so far
      aliases.forEach(function(name) {
        // Add the part name and modifier, if provided
        aliases.push(part.name + '.' + name);
        if (part.modifier) {
          aliases.push(part.modifier + ':' + part.name + '.' + name);
        }
      });

      return aliases;
    }, aliases);

    if (methodName) {
      aliases.push(methodName);
    }

    return aliases;
  };
};
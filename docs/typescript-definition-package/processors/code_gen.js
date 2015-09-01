module.exports = {

  signature: function(remap) {
    return function(ast) {
      try {
        var text = [];
        if (ast.isStatic) text.push('static ');
        text.push(ast.name);
        if (ast.optional) text.push('?');
        if (ast.typeParameters) {
          text.push('<');
          text.push(ast.typeParameters.join(', '));
          text.push('>');
        }
        if (ast.parameters) {
          text.push('(');
          text.push(ast.parameters.join(', '));
          text.push(')');
        }
        if (ast.returnType) {
          text.push(': ', ast.returnType);
        } else if (ast.parameters) {
          text.push(': void');
        } else {
          text.push(': any');
        }
        var string = text.join('');
        for (var key in remap) {
          if (remap.hasOwnProperty(key)) {
            string = string.replace(new RegExp('\\b' + key + '\\b', 'gm'), remap[key]);
          }
        }
        return string;
      } catch (e) {
        console.log(e.toString(), e.stack);
        return 'ERROR: ' + e.toString();
      }
    }
  }
};

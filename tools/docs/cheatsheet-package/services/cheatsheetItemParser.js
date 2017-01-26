/**
 * @dgService
 * @description
 * Parse the text from a cheatsheetItem tag into a cheatsheet item object
 * The text must contain a syntax block followed by zero or more bold matchers and finally a
 * description
 * The syntax block and bold matchers must be wrapped in backticks and be separated by pipes.
 * For example
 *
 * ```
 * `<div [ng-switch]="conditionExpression">
 *   <template [ng-switch-when]="case1Exp">...</template>
 *   <template ng-switch-when="case2LiteralString">...</template>
 *   <template ng-switch-default>...</template>
 * </div>`|`[ng-switch]`|`[ng-switch-when]`|`ng-switch-when`|`ng-switch-default`
 * Conditionally swaps the contents of the div by selecting one of the embedded templates based on
 * the current value of conditionExpression.
 * ```
 *
 * will be parsed into
 *
 * ```
 * {
 *   syntax: '<div [ng-switch]="conditionExpression">\n'+
 *           '  <template [ng-switch-when]="case1Exp">...</template>\n'+
 *           '  <template ng-switch-when="case2LiteralString">...</template>\n'+
 *           '  <template ng-switch-default>...</template>\n'+
 *           '</div>',
 *   bold: ['[ng-switch]', '[ng-switch-when]', 'ng-switch-when', 'ng-switch-default'],
 *   description: 'Conditionally swaps the contents of the div by selecting one of the embedded
 * templates based on the current value of conditionExpression.'
 * }
 * ```
 */
module.exports =
    function cheatsheetItemParser(targetEnvironments) {
  return function(text) {
    var fields = getFields(text, ['syntax', 'description']);

    var item = {syntax: '', bold: [], description: ''};

    fields.forEach(function(field) {
      if (!field.languages || targetEnvironments.someActive(field.languages)) {
        switch (field.name) {
          case 'syntax':
            parseSyntax(field.value.trim());
            break;
          case 'description':
            item.description = field.value.trim();
            break;
        }
      }
    });

    return item;

    function parseSyntax(text) {
      var index = 0;

      if (text.charAt(index) !== '`') throw new Error('item syntax must start with a backtick');

      var start = index + 1;
      index = text.indexOf('`', start);
      if (index === -1) throw new Error('item syntax must end with a backtick');
      item.syntax = text.substring(start, index);
      start = index + 1;

      // skip to next pipe
      while (index < text.length && text.charAt(index) !== '|') index += 1;

      while (text.charAt(start) === '|') {
        start += 1;

        // skip whitespace
        while (start < text.length && /\s/.test(text.charAt(start))) start++;

        if (text.charAt(start) !== '`') throw new Error('bold matcher must start with a backtick');

        start += 1;
        index = text.indexOf('`', start);
        if (index === -1) throw new Error('bold matcher must end with a backtick');
        item.bold.push(text.substring(start, index));
        start = index + 1;
      }

      if (start !== text.length) {
        throw new Error(
            'syntax field must only contain a syntax code block and zero or more bold ' +
            'matcher code blocks, delimited by pipes.\n' +
            'Instead it was "' + text + '"');
      }
    }
  };
}


function getFields(text, fieldNames) {
  var FIELD_START = /^([^:(]+)\(?([^)]+)?\)?:$/;
  var lines = text.split('\n');
  var fields = [];
  var field, line;
  while (lines.length) {
    line = lines.shift();
    var match = FIELD_START.exec(line);
    if (match && fieldNames.indexOf(match[1]) !== -1) {
      // start new field
      if (field) {
        fields.push(field);
      }
      field = {name: match[1], languages: (match[2] && match[2].split(' ')), value: ''};
    } else {
      if (!field)
        throw new Error(
            'item must start with one of the following field specifiers:\n' +
            fieldNames.map(function(field) { return field + ':'; }).join('\n') + '\n' +
            'but instead it contained: "' + text + '"');
      field.value += line + '\n';
    }
  }
  if (field) {
    fields.push(field);
  }

  return fields;
}
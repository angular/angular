var name = 'World';
var message = $localize `Hello, ${name}!`;
var other = $localize(__makeTemplateObject(['try', 'me'], ['try', 'me']), 40 + 2);
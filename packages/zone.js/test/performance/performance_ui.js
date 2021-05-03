/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function(_global) {
var options;

function setAttributes(elem, attrs) {
  if (!attrs) {
    return;
  }
  Object.keys(attrs).forEach(function(key) {
    elem.setAttribute(key, attrs[key]);
  });
}

function createLi(attrs) {
  var li = document.createElement('li');
  setAttributes(li, attrs);
  return li;
}

function createLabel(attrs) {
  var label = document.createElement('label');
  setAttributes(label, attrs);
  return label;
}

function createButton(attrs, innerHtml) {
  var button = document.createElement('button');
  button.innerHTML = innerHtml;
  setAttributes(button, attrs);
  return button;
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createCheckbox(attrs, checked) {
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!checked;
  setAttributes(checkbox, attrs);
  return checkbox;
}

function createUl(attrs) {
  var ul = document.createElement('ul');
  setAttributes(ul, attrs);
  return ul;
}

var serailPromise = _global['__zone_symbol__serialPromise'];

_global['__zone_symbol__testTargetsUIBuild'] = function(_options) {
  options = _options;
  var allButton = createButton({}, 'test selected');
  allButton.addEventListener('click', function() {
    var promiseFactories = [];
    for (var i = 0; i < options.tests.length; i++) {
      var checkbox = document.getElementById('testcheck' + i);
      if (checkbox.checked) {
        var test = options.tests[i];
        promiseFactories.push({
          factory: function(context) {
            return doTest(context.test, context.idx);
          },
          context: {test: test, idx: i}
        });
      }
    }
    serailPromise(promiseFactories);
  });
  options.targetContainer.appendChild(allButton);

  var ul = createUl();
  options.targetContainer.appendChild(ul);

  for (var i = 0; i < options.tests.length; i++) {
    buildTestItemUI(ul, options.tests[i], i);
  }
};

function buildTestItemUI(ul, testItem, idx) {
  var li = createLi({'id': 'test' + idx});

  var button = createButton({'id': 'buttontest' + idx}, 'begin test');
  buildButtonClickHandler(button);

  var title = createTextNode(options.tests[idx].title);
  var checkbox = createCheckbox({'id': 'testcheck' + idx}, true);
  var label = createLabel({'id': 'label' + idx});

  li.appendChild(checkbox);
  li.appendChild(title);
  li.appendChild(button);
  li.appendChild(label);

  ul.appendChild(li);
}

function processTestResult(test, result, id) {
  var split = result.displayText.split('\n');
  options.jsonResult[test.title] = result.rawData;
  options.jsonContainer.innerHTML =
      '<div style="display:none">' + JSON.stringify(options.jsonResult) + '</div>';

  var summary = result.summary;
  var row = options.resultsContainer.insertRow();
  var cell = row.insertCell();
  cell.innerHTML = test.title;
  cell.rowSpan = Object.keys(summary).length;
  var idx = 0;
  Object.keys(summary).forEach(function(key) {
    var tableRow = row;
    if (idx !== 0) {
      tableRow = options.resultsContainer.insertRow();
    }
    var keyCell = tableRow.insertCell();
    keyCell.innerHTML = key;
    var valueCell = tableRow.insertCell();
    valueCell.innerHTML = summary[key];
    idx++;
  });

  var testLi = document.getElementById('test' + id);
  for (var j = 0; j < split.length; j++) {
    var br = document.createElement('br');
    var s = document.createTextNode(split[j]);
    testLi.appendChild(br);
    testLi.appendChild(s);
  }
}

function doTest(test, id) {
  test.cleanFn();
  test.before();
  var button = document.getElementById('buttontest' + id);
  button.setAttribute('enabled', 'false');
  var label = document.getElementById('label' + id);
  label.innerHTML = 'Testing';
  return test.testFn().then(function(result) {
    processTestResult(test, result, id);
    test.after();
    label.innerHTML = 'Finished';
    button.setAttribute('enabled', 'true');
  });
}

function buildButtonClickHandler(button) {
  button.onclick = function(event) {
    var target = event.target;
    var id = target.getAttribute('id').substring(10);
    var test = options.tests[id];
    doTest(test, id);
  };
}
}(typeof window === 'undefined' ? global : window));

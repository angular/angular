// TODO: move the functionality of this module into benchpress itself!

var benchmarkNames = [];

function benchmarkId(index) {
  return 'benchmark' + index;
}

function useBenchmark(index) {
  var search = window.location.search;
  if (search.length > 0) {
    search = search.substring(1);
  }
  if (search.length > 0) {
    return search == benchmarkId(index);
  } else {
    return true;
  }
}

function onLoad(callback) {
  var isReady = document.readyState === 'complete';
  if (isReady) {
    window.setTimeout(callback);
  } else {
    window.addEventListener('load', callback, false);
  }
}

function createBenchmarkMenu() {
  var div = document.createElement('div');
  div.innerHTML += '<h1>Benchmarks:</h1><a class="btn btn-default" href="?">All</a>';
  for (var i=0; i<benchmarkNames.length; i++) {
    var activeClass = useBenchmark(i) ? 'active' : '';
    div.innerHTML += ('<a class="btn btn-default '+activeClass+'" href="?'+benchmarkId(i)+'">'+benchmarkNames[i]+'</a>');
  }
  document.body.insertBefore(div, document.body.childNodes[0]);
}

export function benchmark(name, stepsCreationCallback) {
  benchmarkNames.push(name);
  if (benchmarkNames.length === 2) {
    onLoad(createBenchmarkMenu);
  }
  if (useBenchmark(benchmarkNames.length-1)) {
    stepsCreationCallback();
  }
}

export function benchmarkStep(name, callback) {
  var benchmarkName = benchmarkNames[benchmarkNames.length-1];
  window.benchmarkSteps.push({
    name: benchmarkName + '#' + name, fn: callback
  });
}

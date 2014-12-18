// TODO: migrate to dart as well!
var benchmarkSuites = [];

export function benchmarkSuite(name, stepsCreationCallback) {
  var el = document.createElement('p');
  el.innerHTML = '<b>'+name+'</b><br>';
  document.body.insertBefore(el, document.body.firstChild);

  benchmarkSuites.push({
    element: el
  });
  stepsCreationCallback();
}

export function benchmarkStep(id, name, callback) {
  var benchmarkSuite = benchmarkSuites[benchmarkSuites.length-1];
  var btn = document.createElement('button');
  btn.classList.add('benchpress');
  btn.id = id;
  btn.textContent = name;
  btn.addEventListener('click', callback, false);
  benchmarkSuite.element.appendChild(btn);
}

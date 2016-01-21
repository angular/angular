export function getIntParameter(name: string) {
  return Number.parseInt(getStringParameter(name), 10);
}

export function getStringParameter(name: string) {
  var els = document.querySelectorAll(`input[name="${name}"]`);
  var value;
  var el;

  for (var i = 0; i < els.length; i++) {
    el = els[i];
    var type = el.type;
    if ((type != 'radio' && type != 'checkbox') || el.checked) {
      value = el.getValue();
      break;
    }
  }

  if (!value) {
    throw new Error(`Could not find and input field with name ${name}`);
  }

  return value;
}

export function bindAction(selector: string, callback: Function) {
  var el = document.querySelector(selector);
  el.addEventListener('click', function(_) { callback(); });
}

export function microBenchmark(name, iterationCount, callback) {
  var durationName = `${name}/${iterationCount}`;
  window.console.time(durationName);
  callback();
  window.console.timeEnd(durationName);
}

export function windowProfile(name: string): void {
  (<any>window.console).profile(name);
}

export function windowProfileEnd(name: string): void {
  (<any>window.console).profileEnd(name);
}

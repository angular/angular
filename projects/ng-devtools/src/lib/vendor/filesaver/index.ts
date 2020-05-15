// tslint:disable
/*
 * FileSaver.js
 * A saveAs() FileSaver implementation.
 *
 * By Eli Grey, http://eligrey.com
 *
 * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
 * source  : http://purl.eligrey.com/github/FileSaver.js
 */

// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
var _global = globalThis;

function download(url, name) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    saveAs(xhr.response, name);
  };
  xhr.onerror = function () {
    console.error('could not download file');
  };
  xhr.send();
}

function corsEnabled(url) {
  var xhr = new XMLHttpRequest();
  // use sync to avoid popup blocker
  xhr.open('HEAD', url, false);
  try {
    xhr.send();
  } catch (e) {}
  return xhr.status >= 200 && xhr.status <= 299;
}

// `a.click()` doesn't work for all browsers (#465)
function click(node, _?) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  }
}

function saveAs(blob, name) {
  var URL = _global.URL || _global.webkitURL;
  var a = document.createElement('a');
  name = name || blob.name || 'download';

  a.download = name;
  a.rel = 'noopener'; // tabnabbing

  // TODO: detect chrome extensions & packaged apps
  // a.target = '_blank'

  if (typeof blob === 'string') {
    // Support regular links
    a.href = blob;
    if (a.origin !== location.origin) {
      corsEnabled(a.href) ? download(blob, name) : click(a, (a.target = '_blank'));
    } else {
      click(a);
    }
  } else {
    // Support blobs
    a.href = URL.createObjectURL(blob);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 4e4); // 40s
    setTimeout(function () {
      click(a);
    }, 0);
  }
}

export { saveAs };

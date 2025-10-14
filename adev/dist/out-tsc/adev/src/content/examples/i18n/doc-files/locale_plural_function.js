'use strict';
/* eslint-disable */
// #docregion
function plural(n) {
  let i = Math.floor(Math.abs(n)),
    v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return 1;
  return 5;
}
//# sourceMappingURL=locale_plural_function.js.map

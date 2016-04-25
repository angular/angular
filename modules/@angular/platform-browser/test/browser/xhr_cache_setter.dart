import 'dart:js' as js;

void setTemplateCache(Map cache) {
  if (cache == null) {
    if (js.context.hasProperty(r'$templateCache')) {
      js.context.deleteProperty(r'$templateCache');
    }
    return;
  }

  js.JsObject jsMap = new js.JsObject(js.context['Object']);
  for (String key in cache.keys) {
    jsMap[key] = cache[key];
  }
  js.context[r'$templateCache'] = jsMap;
}

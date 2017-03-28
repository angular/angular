var rules = {
  basehref: {
    from: /<base href=".*"[/]?>/,
    to: '<script>document.write(\'<base href="\' + document.location + \'" />\');</script>'
  },
  angular_pkg: {
    from: /src=".?node_modules\/@angular/g,
    to: 'src="https://unpkg.com/@angular'
  },
  script: {
    from: /<script.*".*%tag%".*>.*<\/script>/,
    to:   '<script src="%tag%"></script>'
  },
  link: {
    from: '/<link rel="stylesheet" href=".*%tag%".*>/',
    to:    '<link rel="stylesheet" href="%tag%">'
  },
  // Clear script like this:
  // <script>
  //   System.import('app').catch(function(err){ console.error(err); });
  // </script>
  system_strip_import_app: {
   from: /<script>[^]?\s*System.import\('app'\)[^]*\/script>/,
   to:   ''
  },
  system_extra_main: {
    from: /main:\s*[\'|\"]index.js[\'|\"]/,
    to:   'main: "index.ts"'
  },
  system_extra_defaultExtension: {
    from: /defaultExtension:\s*[\'|\"]js[\'|\"]/,
    to:   'defaultExtension: "ts"'
  },
  zone_pkg: {
    from: /src=".?node_modules\/zone.js\/dist\/(.*)"/g,
    to:   'src="https://unpkg.com/zone.js/dist/$1?main=browser"'
  },
};

var rulesToApply = [
  {
    pattern: 'basehref',
  },
  {
    pattern: 'script',
    from: 'node_modules/core-js/client/shim.min.js',
    to:   'https://unpkg.com/core-js/client/shim.min.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/zone.js/dist/zone.js',
    to:   'https://unpkg.com/zone.js@0.7.4?main=browser'
  },
  {
    pattern: 'script',
    from: 'node_modules/rxjs/bundles/Rx.js',
    to:   'https://unpkg.com/rxjs@5.0.1/bundles/Rx.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/systemjs/dist/system.src.js',
    to:   'https://unpkg.com/systemjs@0.19.39/dist/system.src.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/angular/in-memory-web-api/web-api.js',
    to:   'https://unpkg.com/angular/in-memory-web-api/web-api.js'
  },

  // Test libraries

  // Plunker recommends getting jasmine from cloudfare
  // Don't upgrade to 2.5.x until following issue resolved
  // https://github.com/jasmine/jasmine/issues/1231
  {
    pattern: 'script',
    from: 'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
    to:   'https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
    to:   'https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine-html.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/jasmine-core/lib/jasmine-core/boot.js',
    to:   'https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/boot.js'
  },
  {
    pattern: 'link',
    from: 'node_modules/jasmine-core/lib/jasmine-core/jasmine.css',
    to:   'https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine.css'
  },
  {
    pattern: 'angular_pkg',
  },
  {
    pattern: 'zone_pkg',
  },
  // {
  //   pattern: 'system_strip_import_app',
  // },
  {
    pattern: 'system_extra_main'
  },
  {
    pattern: 'system_extra_defaultExtension'
  }
];

module.exports = {
  rules: rules,
  rulesToApply: rulesToApply
};

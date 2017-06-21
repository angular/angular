
/** App specific SystemJS configuration */
System.config({

  map: {

    // #docregion systemjs-apollo-client-map
    'apollo-client':                      'npm:apollo-client/apollo.umd.js',
    'apollo-client-rxjs':                 'npm:apollo-client-rxjs/build/bundles/apollo-rxjs.umd.js',
    'apollo-angular':                     'npm:apollo-angular/build/bundles/apollo.umd.js',

    'whatwg-fetch':                       'npm:whatwg-fetch',

    'graphql-anywhere':                   'npm:graphql-anywhere',

    'graphql-tag':                        'npm:graphql-tag',
    'symbol-observable':                  'npm:symbol-observable',
    'redux':                              'npm:redux/dist/redux.min.js',
    // #enddocregion systemjs-apollo-client-map

    // #docregion systemjs-apollo-test-utils-map
    'apollo-test-utils':                              'npm:apollo-test-utils',

    // #docregion systemjs-graphql-server-map
    'graphql':                            'npm:graphql',
    'graphql-tools':                      'npm:graphql-tools',
    'deprecated-decorator':               'npm:deprecated-decorator',
    'node-uuid':                          'npm:node-uuid',
    'uuid':                               'npm:uuid',
    'iterall':                            'npm:iterall',
    'lodash':                             'npm:lodash'
    // #enddocregion systemjs-graphql-server-map
    // #enddocregion systemjs-apollo-test-utils-map
  },
  packages: {

    // #docregion systemjs-apollo-client-packages
    'whatwg-fetch':               { main: './fetch.js', defaultExtension: 'js' },
    'redux':                      { format: 'cjs', defaultExtension: 'js' },
    'graphql-tag':                { main: './index.js', defaultExtension: 'js' },
    'symbol-observable':          { main: './index.js', defaultExtension: 'js' },
    'graphql-anywhere':           {
      main: '/lib/src/index.js',
      defaultExtension: 'js'
    },
    // #enddocregion systemjs-apollo-client-packages

    // #docregion systemjs-apollo-test-utils-packages
    'apollo-test-utils':          { main: '/dist/src/index.js', defaultExtension: 'js' },

    // #docregion systemjs-graphql-server-packages
    'graphql':     {
      main: './index.js',
      defaultExtension: 'js',
      map: {
        './type': './type/index.js',
        './language': './language/index.js',
        './execution': './execution/index.js',
        './validation': './validation/index.js',
        './error': './error/index.js',
        './utilities': './utilities/index.js'
      },
    },
    'graphql-tools':              {
      main: '/dist/index.js',
      defaultExtension: 'js'
    },
    'deprecated-decorator':       { main: '/bld/index.js', defaultExtension: 'js' },
    'node-uuid':                  { main: './uuid.js', defaultExtension: 'js' },
    'uuid':                       { main: './lib/rng-browser.js', defaultExtension: 'js' },
    'iterall':                    { main: './index.js', defaultExtension: 'js' },
    'lodash':                     { main: './index.js', defaultExtension: 'js' }
    // #enddocregion systemjs-graphql-server-packages
    // #enddocregion systemjs-apollo-test-utils-packages
  }
});

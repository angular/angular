const webpack = require('webpack');

module.exports = {
  entry: {
    'content-script': 'projects/shell-chrome/src/app/content-script.ts',
    'ng-validate': 'projects/shell-chrome/src/app/ng-validate.ts',
    background: 'projects/shell-chrome/src/app/background.ts',
    backend: 'projects/shell-chrome/src/app/backend.ts',
    devtools: 'projects/shell-chrome/src/devtools.ts',
  },
  output: {
    chunkLoadingGlobal: '___ngDevToolsRuntime',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        LATEST_SHA: JSON.stringify(process.env.LATEST_SHA),
      },
    }),
  ],
};

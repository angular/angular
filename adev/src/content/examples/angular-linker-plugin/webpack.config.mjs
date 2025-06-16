// #docplaster ...
// #docregion webpack-config
import linkerPlugin from '@angular/compiler-cli/linker/babel';

export default {
  // #enddocregion webpack-config
  // #docregion webpack-config
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [linkerPlugin],
            compact: false,
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  // #enddocregion webpack-config
  // #docregion webpack-config
};
// #enddocregion webpack-config

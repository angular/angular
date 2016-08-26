'use strict';

import * as fs from 'fs';
import * as path from 'path';
import baseConfig from '{{base_config}}';


const prefixes = [{{prefixes}}];

/**
 * A Rollup plugin that (wrongly) assumes that source maps can be found by
 * suffixing ".map" and tries to do that.
 */
class LoadSourceMapHeuristicPlugin {
  load(id) {
    const code = fs.readFileSync(id).toString();

    let map;
    try {
      map = fs.readFileSync(id + '.map').toString();
    } catch (err) {
    }

    return {code: code, map: map};
  }
}

const config = Object.assign({}, baseConfig, {
  entry: '{{entry}}',
  dest: '{{dest}}',
  sourceMap: true,

  banner: '{{banner}}' ? fs.readFileSync('{{banner}}').toString() : '',

  // Make rollup shut up.
  onwarn: msg => {
    if (!msg.match(/as external dependency$/)) {
      console.log(msg);
    }
  },

  plugins: (baseConfig.plugins || []).concat([new LoadSourceMapHeuristicPlugin()])
});

export default config;

import url from 'url';
import path from 'path';

/** Path to the ESBuild configuration maintained by the user. */
const userConfigExecPath = 'TMPL_CONFIG_PATH';

/** User ESBuild config. Empty if none is loaded. */
let userConfig = {};

if (userConfigExecPath !== '') {
  const userConfigPath = path.join(process.cwd(), userConfigExecPath);
  const userConfigUrl = url.pathToFileURL(userConfigPath);

  // Load the user config, assuming it is set as `default` export.
  userConfig = (await import(userConfigUrl)).default;
}

export default {
  ...userConfig,
  globalName: '__exports',
  format: 'iife',
  banner: {js: 'define("TMPL_MODULE_NAME", [], function() {'},
  footer: {js: 'return __exports;})'},
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launcher_1 = require("./launcher");
const reporter_1 = require("./reporter");
const sauceconnect_1 = require("./local-tunnel/sauceconnect");
module.exports = {
    // TODO: make these injectable's classes by using factories.
    'launcher:SauceLabs': ['type', launcher_1.SaucelabsLauncher],
    'reporter:saucelabs': ['type', reporter_1.SaucelabsReporter],
    // Provide a service for establishing a SauceConnect tunnel.
    'SauceConnect': ['type', sauceconnect_1.SauceConnect],
    // Provide a map that can be used to determine information about browsers that
    // have been launched with Saucelabs.
    'browserMap': ['value', new Map()]
};
//# sourceMappingURL=index.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
// This import lacks type definitions.
const launchSauceConnect = util_1.promisify(require('sauce-connect-launcher'));
/**
 * Service that can be used to create a SauceConnect tunnel automatically. This can be used
 * in case developers don't set up the tunnel using the plain SauceConnect binaries.
 */
function SauceConnect(emitter, logger) {
    const log = logger.create('launcher.SauceConnect');
    // Currently active tunnel instance. See: https://github.com/bermi/sauce-connect-launcher
    // for public API.
    let activeInstancePromise = null;
    this.establishTunnel = (connectOptions) => __awaiter(this, void 0, void 0, function* () {
        // Redirect all logging output to Karma's logger.
        connectOptions.logger = log.debug.bind(log);
        // In case there is already a promise for a SauceConnect tunnel, we still need to return the
        // promise because we want to make sure that the launcher can wait in case the tunnel is
        // still starting.
        if (activeInstancePromise) {
            return activeInstancePromise;
        }
        // Open a new SauceConnect tunnel.
        return activeInstancePromise = launchSauceConnect(connectOptions);
    });
    // Close the tunnel whenever Karma emits the "exit" event. In that case, we don't need to
    // reset the state because Karma will exit completely.
    emitter.on('exit', (doneFn) => {
        if (activeInstancePromise) {
            log.debug('Shutting down Sauce Connect');
            // Close the tunnel and notify Karma once the tunnel has been exited.
            activeInstancePromise
                .then(instance => instance.close(doneFn()))
                .catch(() => doneFn());
        }
        else {
            doneFn();
        }
    });
}
exports.SauceConnect = SauceConnect;
//# sourceMappingURL=sauceconnect.js.map
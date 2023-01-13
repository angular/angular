/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {BrowserDetection} from '../testing/src/browser_util';

{
  describe('BrowserDetection', () => {
    const browsers = [
      {
        name: 'Chrome',
        ua: 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: true,
        isOldChrome: false
      },
      {
        name: 'Chrome mobile',
        ua: 'Mozilla/5.0 (Linux; Android 5.1.1; D5803 Build/23.4.A.0.546) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.133 Mobile Safari/537.36',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Firefox',
        ua: 'Mozilla/5.0 (X11; Linux i686; rv:40.0) Gecko/20100101 Firefox/40.0',
        isFirefox: true,
        isAndroid: false,
        isEdge: false,
        isWebkit: false,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Edge',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136',
        isFirefox: false,
        isAndroid: false,
        isEdge: true,
        isWebkit: false,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Android4.1',
        ua: 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-us; Android SDK built for x86 Build/JRO03H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        isFirefox: false,
        isAndroid: true,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: true,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Android4.2',
        ua: 'Mozilla/5.0 (Linux; U; Android 4.2; en-us; Android SDK built for x86 Build/JOP40C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        isFirefox: false,
        isAndroid: true,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: true,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Android4.3',
        ua: 'Mozilla/5.0 (Linux; U; Android 4.3; en-us; Android SDK built for x86 Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        isFirefox: false,
        isAndroid: true,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: true,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Android4.4',
        ua: 'Mozilla/5.0 (Linux; Android 4.4.2; Android SDK built for x86 Build/KK) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: true
      },
      {
        name: 'Safari7',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/7.1.7 Safari/537.85.16',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'Safari8',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'iOS7',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: true,
        isSlow: true,
        isChromeDesktop: false,
        isOldChrome: false
      },
      {
        name: 'iOS8',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12H141 Safari/600.1.4',
        isFirefox: false,
        isAndroid: false,
        isEdge: false,
        isWebkit: true,
        isIOS7: false,
        isSlow: false,
        isChromeDesktop: false,
        isOldChrome: false
      }
    ];

    browsers.forEach((browser: {[key: string]: any}) => {
      it(`should detect ${browser['name']}`, () => {
        const bd = new BrowserDetection(<string>browser['ua']);
        expect(bd.isFirefox).toBe(browser['isFirefox']);
        expect(bd.isAndroid).toBe(browser['isAndroid']);
        expect(bd.isEdge).toBe(browser['isEdge']);
        expect(bd.isWebkit).toBe(browser['isWebkit']);
        expect(bd.isIOS7).toBe(browser['isIOS7']);
        expect(bd.isSlow).toBe(browser['isSlow']);
        expect(bd.isChromeDesktop).toBe(browser['isChromeDesktop']);
        expect(bd.isOldChrome).toBe(browser['isOldChrome']);
      });
    });
  });
}

/// <reference types="node"/>

import './browser_symbol_setup';
import './wtf_mock';
import './test-env-setup-jasmine';

import {setupFakePolyfill} from './test_fake_polyfill';

setupFakePolyfill();

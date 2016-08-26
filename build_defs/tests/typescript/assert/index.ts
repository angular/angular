import {useInternal} from 'use_internal';
import {useTransitive} from 'use_transitive';
import {useAmbient} from 'use_ambient';
import {useTransitiveAmbient} from 'use_transitive_ambient';
import {useGeneratedSource} from 'use_generated_source';

// We cannot use @types/node since we already declared process: any.
declare const require: any;
const assert: any = require('assert');

assert.equal(useInternal, 'new A().b');
assert.equal(useTransitive, 'new A().c');
assert.equal(useAmbient, process.cwd());
assert.equal(useTransitiveAmbient, process.cwd());
assert.equal(useGeneratedSource, 'useGeneratedSource');

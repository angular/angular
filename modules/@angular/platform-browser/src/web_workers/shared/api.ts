import {CONST_EXPR} from '@angular/facade';
import {OpaqueToken} from '@angular/core/src/di';

export const ON_WEB_WORKER = CONST_EXPR(new OpaqueToken('WebWorker.onWebWorker'));

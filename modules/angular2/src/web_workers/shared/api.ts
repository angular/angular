import {CONST_EXPR} from "angular2/src/facade/lang";
import {OpaqueToken} from "angular2/src/core/di";

export const ON_WEB_WORKER = CONST_EXPR(new OpaqueToken('WebWorker.onWebWorker'));

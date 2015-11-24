import { XHR } from 'angular2/src/compiler/xhr';
import { Promise } from 'angular2/src/facade/async';
export declare class MockXHR extends XHR {
    private _expectations;
    private _definitions;
    private _requests;
    get(url: string): Promise<string>;
    expect(url: string, response: string): void;
    when(url: string, response: string): void;
    flush(): void;
    verifyNoOustandingExpectations(): void;
    private _processRequest(request);
}

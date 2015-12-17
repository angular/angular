import { XHR } from 'angular2/src/compiler/xhr';
import { Promise } from 'angular2/src/facade/async';
/**
 * A mock implementation of {@link XHR} that allows outgoing requests to be mocked
 * and responded to within a single test, without going to the network.
 */
export declare class MockXHR extends XHR {
    private _expectations;
    private _definitions;
    private _requests;
    get(url: string): Promise<string>;
    /**
     * Add an expectation for the given URL. Incoming requests will be checked against
     * the next expectation (in FIFO order). The `verifyNoOutstandingExpectations` method
     * can be used to check if any expectations have not yet been met.
     *
     * The response given will be returned if the expectation matches.
     */
    expect(url: string, response: string): void;
    /**
     * Add a definition for the given URL to return the given response. Unlike expectations,
     * definitions have no order and will satisfy any matching request at any time. Also
     * unlike expectations, unused definitions do not cause `verifyNoOutstandingExpectations`
     * to return an error.
     */
    when(url: string, response: string): void;
    /**
     * Process pending requests and verify there are no outstanding expectations. Also fails
     * if no requests are pending.
     */
    flush(): void;
    /**
     * Throw an exception if any expectations have not been satisfied.
     */
    verifyNoOutstandingExpectations(): void;
    private _processRequest(request);
}

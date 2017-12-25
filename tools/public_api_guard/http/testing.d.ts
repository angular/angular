/** @deprecated */
export declare class MockBackend implements ConnectionBackend {
    connections: Subject<MockConnection>;
    connectionsArray: MockConnection[];
    pendingConnections: Subject<MockConnection>;
    constructor();
    createConnection(req: Request): MockConnection;
    resolveAllConnections(): void;
    verifyNoPendingRequests(): void;
}

/** @deprecated */
export declare class MockConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: ReplaySubject<Response>;
    constructor(req: Request);
    mockDownload(res: Response): void;
    mockError(err?: Error): void;
    mockRespond(res: Response): void;
}

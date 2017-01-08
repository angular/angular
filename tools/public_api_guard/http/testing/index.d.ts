/** @experimental */
export declare class MockBackend implements ConnectionBackend {
    connections: EventEmitter<MockConnection>;
    connectionsArray: MockConnection[];
    pendingConnections: EventEmitter<MockConnection>;
    constructor();
    createConnection(req: Request): MockConnection;
    resolveAllConnections(): void;
    verifyNoPendingRequests(): void;
}

/** @experimental */
export declare class MockConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: ReplaySubject<Response>;
    constructor(req: Request);
    mockDownload(res: Response): void;
    mockError(err?: Error): void;
    mockRespond(res: Response): void;
}

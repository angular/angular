/** @experimental */
export declare class MockBackend implements ConnectionBackend {
    connections: any;
    connectionsArray: MockConnection[];
    pendingConnections: any;
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

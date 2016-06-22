export declare class MockBackend implements ConnectionBackend {
    connections: any;
    connectionsArray: MockConnection[];
    pendingConnections: any;
    constructor();
    verifyNoPendingRequests(): void;
    resolveAllConnections(): void;
    createConnection(req: Request): MockConnection;
}

export declare class MockConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: ReplaySubject<Response>;
    constructor(req: Request);
    mockRespond(res: Response): void;
    mockDownload(res: Response): void;
    mockError(err?: Error): void;
}

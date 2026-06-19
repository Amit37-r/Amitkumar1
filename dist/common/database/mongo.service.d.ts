export declare class MongoService {
    private static instance;
    private connected;
    private constructor();
    static getInstance(): MongoService;
    connect(uri: string): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}
//# sourceMappingURL=mongo.service.d.ts.map
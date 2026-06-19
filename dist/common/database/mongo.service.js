import mongoose from 'mongoose';
import { LoggerService } from '../logger/logger.service';
export class MongoService {
    static instance;
    connected = false;
    constructor() { }
    static getInstance() {
        if (!MongoService.instance) {
            MongoService.instance = new MongoService();
        }
        return MongoService.instance;
    }
    async connect(uri) {
        if (this.connected)
            return;
        const logger = LoggerService.getInstance();
        try {
            await mongoose.connect(uri);
            this.connected = true;
            logger.info('MongoDB', 'Connected successfully');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('MongoDB', `Connection failed: ${message}`);
            throw error;
        }
    }
    async disconnect() {
        if (!this.connected)
            return;
        await mongoose.disconnect();
        this.connected = false;
    }
    isConnected() {
        return this.connected;
    }
}
//# sourceMappingURL=mongo.service.js.map
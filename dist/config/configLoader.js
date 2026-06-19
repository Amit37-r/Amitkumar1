import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const DEFAULTS = {
    dailyTarget: 50,
    deadline: '23:59',
    scanIntervalMinutes: 5,
    platform: 'linkedin',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
    backendPort: 4000,
    frontendPort: 3000,
    publicFields: [],
};
function validateConfig(config) {
    const errors = [];
    if (config.dailyTarget !== undefined) {
        if (typeof config.dailyTarget !== 'number' || config.dailyTarget < 1) {
            errors.push('dailyTarget must be a positive number');
        }
    }
    if (config.deadline !== undefined) {
        if (typeof config.deadline !== 'string' || !/^\d{1,2}:\d{2}$/.test(config.deadline)) {
            errors.push('deadline must be in HH:mm format');
        }
    }
    if (config.scanIntervalMinutes !== undefined) {
        if (typeof config.scanIntervalMinutes !== 'number' || config.scanIntervalMinutes < 1) {
            errors.push('scanIntervalMinutes must be a positive number');
        }
    }
    if (config.codeFolders !== undefined) {
        if (!Array.isArray(config.codeFolders) || config.codeFolders.length === 0) {
            errors.push('codeFolders must be a non-empty array of folder paths');
        }
        else if (!config.codeFolders.every((f) => typeof f === 'string')) {
            errors.push('codeFolders must contain only strings');
        }
    }
    else {
        errors.push('codeFolders is required and must be a non-empty array');
    }
    if (config.platform !== undefined) {
        if (config.platform !== 'linkedin' && config.platform !== 'x') {
            errors.push('platform must be either "linkedin" or "x"');
        }
    }
    if (config.ollamaUrl !== undefined) {
        if (typeof config.ollamaUrl !== 'string' || config.ollamaUrl.length === 0) {
            errors.push('ollamaUrl must be a non-empty string');
        }
    }
    if (config.ollamaModel !== undefined) {
        if (typeof config.ollamaModel !== 'string' || config.ollamaModel.length === 0) {
            errors.push('ollamaModel must be a non-empty string');
        }
    }
    if (config.backendPort !== undefined) {
        if (typeof config.backendPort !== 'number' || config.backendPort < 1 || config.backendPort > 65535) {
            errors.push('backendPort must be a valid port number (1-65535)');
        }
    }
    if (config.frontendPort !== undefined) {
        if (typeof config.frontendPort !== 'number' || config.frontendPort < 1 || config.frontendPort > 65535) {
            errors.push('frontendPort must be a valid port number (1-65535)');
        }
    }
    if (config.publicFields !== undefined) {
        if (!Array.isArray(config.publicFields)) {
            errors.push('publicFields must be an array');
        }
    }
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n  - ${errors.join('\n  - ')}`);
    }
    return {
        ...DEFAULTS,
        ...config,
    };
}
export function loadConfig(configPath) {
    const filePath = configPath ?? resolve(process.cwd(), 'config.json');
    if (!existsSync(filePath)) {
        console.error(`ERROR: Configuration file not found at: ${filePath}`);
        console.error('Please create a config.json file. See README for required fields.');
        process.exit(1);
    }
    let rawContent;
    try {
        rawContent = readFileSync(filePath, 'utf-8');
    }
    catch (err) {
        console.error(`ERROR: Unable to read configuration file at: ${filePath}`);
        console.error(err.message);
        process.exit(1);
    }
    let parsed;
    try {
        parsed = JSON.parse(rawContent);
    }
    catch (err) {
        console.error(`ERROR: Configuration file contains invalid JSON: ${filePath}`);
        console.error(err.message);
        process.exit(1);
    }
    return validateConfig(parsed);
}
export { validateConfig };
//# sourceMappingURL=configLoader.js.map
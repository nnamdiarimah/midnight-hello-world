import { createLogger } from './logger-utils.js';
import { run } from './index.js';
import { DevnetRemoteConfig } from './config';

const CONFIG = new DevnetRemoteConfig();
CONFIG.setNetworkId();
const logger = await createLogger(CONFIG.logDir);
await run(CONFIG, logger);

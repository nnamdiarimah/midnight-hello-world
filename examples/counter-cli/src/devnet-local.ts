import { createLogger } from './logger-utils.js';
import { run } from './index.js';
import { DevnetLocalConfig } from './config';

const CONFIG = new DevnetLocalConfig();
CONFIG.setNetworkId();
const logger = await createLogger(CONFIG.logDir);
await run(CONFIG, logger);

import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { createLogger } from './logger-utils.js';
import { run } from './index.js';
import path from 'node:path';
import { currentDir, DevnetRemoteConfig } from './config';

const CONFIG = new DevnetRemoteConfig();
CONFIG.setNetworkId();
const dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'proof-server.yml').withWaitStrategy(
  'proof-server',
  Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1),
);
const logger = await createLogger(CONFIG.logDir);
await run(CONFIG, logger, dockerEnv);

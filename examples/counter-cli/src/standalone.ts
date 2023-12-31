import { createLogger } from './logger-utils.js';
import path from 'node:path';
import { run } from './index.js';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { currentDir, StandaloneConfig } from './config';

const CONFIG = new StandaloneConfig();
CONFIG.setNetworkId();
const dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'test-compose.yml')
  .withWaitStrategy('proof-server', Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1))
  .withWaitStrategy('indexer', Wait.forLogMessage(/http4s v[\d.]+ on blaze v[\d.]+ started at /, 1));
const logger = await createLogger(CONFIG.logDir);
await run(CONFIG, logger, dockerEnv);

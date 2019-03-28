const _ = require('lodash');
const config = require('./config.json');
const defaultConfig = config.default;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

// if production environment, use mongo user/pass from .env
let configEnv = environment.toUpperCase();
finalConfig.db_user = process.env[`MONGO_${configEnv}_USER`];
finalConfig.db_pass = process.env[`MONGO_${configEnv}_USER`];

// build mongo uri
let credentials = (String(finalConfig.db_user).length && String(finalConfig.db_pass).length) ? `${finalConfig.db_user}:${finalConfig.db_pass}@` : ''; // if credentials, use them, if not, blank
finalConfig.db_uri = `mongodb://${credentials}${finalConfig.db_host}:${finalConfig.db_port}/${finalConfig.db_name}`;

console.log('finalConfig: ============');
console.log(finalConfig);

module.exports = finalConfig;
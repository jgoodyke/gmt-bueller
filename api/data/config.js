const _ = require('lodash');
const config = require('./config.json');
const environment = process.env.NODE_ENV || 'development';
const engine = process.env.STUDENT_DATA_ENGINE || 'redshift';
const defaultConfig = config.default[engine]; // get default config
const engineConfig = config[environment][engine]; // get config specific to select engine
const finalConfig = _.merge(defaultConfig, engineConfig); // merge to final config

let dataEngine = finalConfig.config_id.toUpperCase();
let dataEnv = environment.toUpperCase();
finalConfig.user = process.env[`DATA_${dataEngine}_${dataEnv}_USER`];
finalConfig.password = process.env[`DATA_${dataEngine}_${dataEnv}_PASS`];

module.exports = finalConfig;
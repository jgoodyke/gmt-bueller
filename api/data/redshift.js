module.exports = function(database) {

  const config = require('./config');
  const { Pool } = require('pg');

  config.database = database;
  
  console.log(config);
  
  const pool = new Pool({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port
  });
  
  // pool.connect(err => {
  //   console.log('err: ============');
  //   console.log(err);
  //   if (err) console.log(`Error connecting database: ${err}`);
  //   else console.log(`Database connection established: ${config.config_id} | ${config.database}`);
  // });

  // pool.on('error', (err, client) => {
  //   console.error('Unexpected error on idle client', err)
  //   process.exit(-1)
  // })
  
  return pool;
}



// module.exports = function(database) {

//   const config = require('./config');
//   const { Pool } = require('pg');

//   config.database = database;
  
//   console.log(config);
  
//   const pool = new Pool({
//     user: config.user,
//     host: config.host,
//     database: config.database,
//     password: config.password,
//     port: config.port
//   });
  
//   pool.connect(err => {
//     console.log('err: ============');
//     console.log(err);
//     if (err) console.log(`Error connecting database: ${err}`);
//     else console.log(`Database connection established: ${config.config_id} | ${config.database}`);
//   });

//   pool.on('error', (err, client) => {
//     console.error('Unexpected error on idle client', err)
//     process.exit(-1)
//   })
  
//   return pool;
// }

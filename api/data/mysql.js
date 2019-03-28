module.exports = function(database) {

  const config = require('./config');
  const mysql = require('mysql');
  
  config.database = database;
  
  console.log(config);
  
  const connection = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    insecureAuth: true
  });
    
  connection.connect(err => {
    if (err) console.log(`Error connecting database: ${err}`);
    else console.log(`Data database connection established: ${config.config_id} | ${config.database}`);
  });
    
  return connection;
}
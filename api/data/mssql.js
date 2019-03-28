module.exports = function(database) {

  const config = require('./config');
  const mssql = require('mssql');
    
  config.database = database;
  
  console.log(config);
  
  let conParams = {
    server: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  };
      
  mssql.connect(conParams, (err) => {
    if (err) console.log(`Error connecting database: ${err}`);
    else console.log(`Database connection established: ${config.config_id} | ${config.database}`);
  });
  return mssql;
}
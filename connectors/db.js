// import the knex library that will allow us to
// construct SQL statements
const knex = require("knex");

// define the configuration settings to connect
// to our local postgres server
const config = {
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
<<<<<<< HEAD
    user: "postgres",
    password: "q1234567",
    database: "postgres",
  },
=======
    user: 'postgres',
    password: 'alizein123',
    database: 'SE_MileStone2',
  }
>>>>>>> f8c47e3913b81c2ee5c7117856152667b658a6d4
};

// create the connection with postgres
const db = knex(config);

// expose the created connection so we can
// use it in other files to make sql statements
module.exports = db;

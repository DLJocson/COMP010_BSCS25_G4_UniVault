const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "kV:a7ij?,8GbSKG",
    database: "univault_schema",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.query('SELECT * FROM customer');
    console.log(rows);
  } catch (error) {
    console.error(error);
  }
})();

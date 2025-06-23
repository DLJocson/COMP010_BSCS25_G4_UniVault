const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "padayon",
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

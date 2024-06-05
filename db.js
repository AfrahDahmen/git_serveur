const mysql = require('mysql');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "remorquage"
});

// Établir la connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connexion à la base de données réussie');
});

// Exporter la connexion à la base de données pour l'utiliser dans d'autres fichiers
module.exports = db;

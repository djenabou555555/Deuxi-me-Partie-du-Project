const mysql = require('mysql2');
//données de connexion a la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gourmand',
    port: 3306,
});
//connexion a la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    } else {
        console.log('Connexion réussie à la base de données');
    }
});
//exportation de la connexion a la base de données
module.exports = db;

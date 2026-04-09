//serveur express
const express = require('express');
//configuration de l'environnement
require('dotenv').config();
//configuration de la base de données
const db = require('./config/db');
//création de l'application express
const app = express();
//utilisation du middleware pour parser le corps des requêtes en JSON
app.use(express.json());
//montage des routes
app.use('/', require('./routes/livres'));
//port
const PORT = process.env.PORT || 7000;
app.get('/', (req, res) => {
    res.send('Hello toi!');
});

//démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

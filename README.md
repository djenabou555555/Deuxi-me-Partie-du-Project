# TP API – Gestion des utilisateurs et produits

## Présentation du projet

Ce projet consiste à développer une API REST avec Node.js et Express permettant de gérer :
* les utilisateurs (authentification JWT)
* les ouvrages (CRUD)
* les catégories
* le panier et les commandes
* les avis et commentaires
* les listes de cadeaux
L’API respecte les règles métier demandées (gestion du stock, validation des commentaires, sécurité des accès, etc.).

## 👥 Membres et rôles

  Djenabou Diallo
   Développement backend (routes, authentification,readaction du readme)
  Victor (base de données, certaine routes,documentation)

## Structure du dépôt

```id="m3f6v7"
tp-api/
│
├── config/
│   └── db.js
│
├── middleware/
│   └── auth.js
│
├── routes/
│   └── livres.js
│
├── .env
├── server.js
├── package.json

---

## ⚙️ Installation et exécution

### 1. Cloner le projet

```bash id="9e0xhz"
git clone https://github.com/djenabou555555/Deuxi-me-Partie-du-Project.git
cd Deuxi-me-Partie-du-Project
```

---

### 2. Installer les dépendances

npm install express
npm install mysql2
npm install brypt
npm install jsonwebtoken
npm install dotenv

```
---
### 3. Configuration de l’environnement
Créer un fichier `.env` à la racine :

```env id="mczk8u"
PORT=7000
JWT_SECRET=secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gourmand
```
---

### 4. Importer la base de données

* Ouvrir phpMyAdmin
* Créer une base de données : `gourmand`
* Importer le fichier `gourmand.sql`

---

### 5. Lancer le serveur

```bash id="9h6l3p"
node server.js
```
Le serveur démarre sur :

```id="9f8r1y"
http://localhost:7000
```

---

## Authentification

### POST /api/auth/login

```json id="0aw9tq"
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

Retourne un token JWT à utiliser dans les routes protégées :

```id="c3q7fd"
Authorization: Bearer TOKEN
```

---

## Endpoints principaux

###  Utilisateurs

* GET /api/users/me
* PUT /api/users/:id
* GET /api/users (admin)

---

###  Ouvrages

* GET /api/ouvrages
* GET /api/ouvrages/:id
* POST /api/ouvrages
* PUT /api/ouvrages/:id
* DELETE /api/ouvrages/:id

---

### Catégories

* GET /api/categories
* POST /api/categories
* PUT /api/categories/:id
* DELETE /api/categories/:id

---

### Panier

* GET /api/panier
* POST /api/panier/items
* PUT /api/panier/items/:id
* DELETE /api/panier/items/:id

---

### Commandes

* POST /api/commandes
* GET /api/commandes
* GET /api/commandes/:id
* PUT /api/commandes/:id/status

---

### Listes de cadeaux

* POST /api/listes
* GET /api/listes/:code
* POST /api/listes/:id/acheter

---

###  Avis et commentaires

* POST /api/ouvrages/:id/avis
* POST /api/ouvrages/:id/commentaires
* PUT /api/commentaires/:id/valider

---

##  Technologies utilisées

* Node.js
* Express
* MySQL
* JWT (authentification)
* bcrypt (sécurité des mots de passe)

---

## Sécurité

* Authentification avec JWT
* Hash des mots de passe avec bcrypt
* Gestion des rôles :

  * client
  * editeur
  * gestionnaire
  * administrateur

## Remarques

* Les routes sensibles sont protégées
* Les règles métier sont respectées (stock, avis après achat, validation des commentaires)
* Le projet peut être amélioré avec une meilleure séparation (controllers/services)

---

## Conclusion

Ce projet démontre la mise en place d’une API REST complète avec gestion des utilisateurs, produits et commandes, en respectant les bonnes pratiques de développement backend.

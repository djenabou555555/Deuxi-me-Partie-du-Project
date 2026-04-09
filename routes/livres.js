const express = require('express');
const router = express.Router();

const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

const saltRounds = 10;
const SECRET = process.env.JWT_SECRET || "secret";


//POST /register : inscription hash mot de passe avec nom et password_hash
router.post('/register', verifyToken,(req, res) => {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password) {
        return res.status(400).json({ message: 'Champs requis' });
    }
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur hash' });
            }

            const sql = `
                INSERT INTO users (nom, email, password_hash, role, actif)
                VALUES (?, ?, ?, 'client', 1)
            `;

            db.query(sql, [nom, email, hash], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Erreur DB' });
                }

                res.status(201).json({ message: 'Inscription réussie' });
            });
        });
    });
});
//POST /login : connexion, vérification du mot de passe et génération d'un token JWT
router.post('/api/auth/login', verifyToken,(req, res) => {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // chercher utilisateur
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const user = result[0];

        // comparer mot de passe
        bcrypt.compare(password, user.password_hash, (err, valid) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur bcrypt' });
            }

            if (!valid) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }

            // 🔐 génération JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "1h" }
            );

            res.json({
                message: "Connexion réussie",
                token
            });
        });
    });
});
//verification du token pour les routes protégées
router.get('/api/users/me', verifyToken, (req, res) => {

    const userId = req.user.id;

    db.query(
        "SELECT id, nom, email, role FROM users WHERE id = ?",
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json({ message: "Erreur DB" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            res.json(result[0]);
        }
    );
});
// route put pour mettre à jour le mot de passe
router.put('/api/users/:id', verifyToken, (req, res) => {

    const userId = req.params.id;
    const { nom, email } = req.body;

    //  vérifier permission
    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
    }

    // update
    const sql = "UPDATE users SET nom = ?, email = ? WHERE id = ?";

    db.query(sql, [nom, email, userId], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        res.json({ message: 'Utilisateur modifié' });
    });

});
//route pour admin
router.get('/api/users', verifyToken, (req, res) => {

    // vérifier admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé (admin seulement)' });
    }

    // récupérer tous les users
    db.query("SELECT id, nom, email, role FROM users", (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        res.json(result);
    });

});
// GET /api/panier : récupérer panier actuel (client) 
router.get('/api/panier', verifyToken, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT *
        FROM panier_items
        WHERE panier_id = ?
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        res.json(result);
    });

});

router.get('/api/ouvrages', verifyToken,(req, res) => {

    let sql = "SELECT * FROM ouvrages WHERE stock > 0";

    if (req.query.texte) {
        sql += ` AND titre LIKE '%${req.query.texte}%'`;
    }

    if (req.query.categorie) {
        sql += ` AND categorie_id = ${req.query.categorie}`;
    }

    if (req.query.popularite) {
        sql += " ORDER BY popularite DESC";
    }

    db.query(sql, (err, result) => {
        res.json(result);
    });
});

router.get('/api/ouvrages/:id', verifyToken, (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT o.*, a.note
        FROM ouvrages o
        LEFT JOIN avis a ON o.id = a.ouvrage_id
        WHERE o.id = ? AND (a.valide = 1 OR a.valide IS NULL)
    `;

    db.query(sql, [id], (err, result) => {
        res.json(result);
    });
});

router.post('/api/ouvrages', verifyToken, (req, res) => {

    if (!["gestionnaire", "editeur"].includes(req.user.role)) {
        return res.status(403).send("Accès refusé");
    }

    const { titre, auteur, prix, stock } = req.body;

    db.query(
        "INSERT INTO ouvrages (titre, auteur, prix, stock) VALUES (?, ?, ?, ?)",
        [titre, auteur, prix, stock],
        () => res.send("Ouvrage ajouté")
    );
});

router.put('/api/ouvrages/:id', verifyToken, (req, res) => {

    const { titre, auteur, prix, stock } = req.body;

    db.query(
        "UPDATE ouvrages SET titre=?, auteur=?, prix=?, stock=? WHERE id=?",
        [titre, auteur, prix, stock, req.params.id],
        () => res.send("Modifié")
    );
});

router.delete('/api/ouvrages/:id', verifyToken, (req, res) => {

    db.query(
        "DELETE FROM ouvrages WHERE id=?",
        [req.params.id],
        () => res.send("Supprimé")
    );
});

router.get('/api/categories', (req, res) => {
    db.query("SELECT * FROM categories", (err, result) => {
        res.json(result);
    });
});

router.get('/api/categories', verifyToken, (req, res) => {
    db.query("SELECT * FROM categories", (err, result) => {
        res.json(result);
    });
});

router.put('/api/categories/:id', verifyToken, (req, res) => {

    db.query(
        "UPDATE categories SET nom=? WHERE id=?",
        [req.body.nom, req.params.id],
        () => res.send("Modifié")
    );
});

router.delete('/api/categories/:id', verifyToken, (req, res) => {

    db.query(
        "DELETE FROM categories WHERE id=?",
        [req.params.id],
        () => res.send("Supprimé")
    );
});

router.put('/api/panier/items/:id', verifyToken, (req, res) => {

    db.query(
        "UPDATE panier_items SET quantite=? WHERE id=?",
        [req.body.quantite, req.params.id],
        () => res.send("Quantité modifiée")
    );
});

router.delete('/api/panier/items/:id', verifyToken, (req, res) => {

    db.query(
        "DELETE FROM panier_items WHERE id=?",
        [req.params.id],
        () => res.send("Supprimé")
    );
});

router.post('/api/commandes', verifyToken, (req, res) => {

    db.query(
        "INSERT INTO commandes (client_id) VALUES (?)",
        [req.user.id],
        (err, result) => {
            res.json({
                paiement_url: "http://fake-paiement/" + result.insertId
            });
        }
    );
});

router.get('/api/commandes', verifyToken, (req, res) => {

    db.query(
        "SELECT * FROM commandes WHERE client_id=?",
        [req.user.id],
        (err, result) => res.json(result)
    );
});

router.get('/api/commandes/:id', verifyToken, (req, res) => {

    db.query(
        "SELECT * FROM commandes WHERE id=?",
        [req.params.id],
        (err, result) => res.json(result[0])
    );
});

router.put('/api/commandes/:id/status', verifyToken, (req, res) => {

    db.query(
        "UPDATE commandes SET status=? WHERE id=?",
        [req.body.status, req.params.id],
        () => res.send("Status modifié")
    );
});

router.post('/api/listes', verifyToken, (req, res) => {

    const code = Math.random().toString(36).substring(2, 8);

    db.query(
        "INSERT INTO listes (client_id, code_partage) VALUES (?, ?)",
        [req.user.id, code],
        () => res.json({ code })
    );
});

router.get('/api/listes/:code', (req, res) => {

    db.query(
        "SELECT * FROM listes WHERE code_partage=?",
        [req.params.code],
        (err, result) => res.json(result[0])
    );
});

router.post('/api/listes/:id/acheter', (req, res) => {

    res.send("Achat simulé");
});

router.post('/api/ouvrages/:id/avis', verifyToken, (req, res) => {

    db.query(
        "INSERT INTO avis (client_id, ouvrage_id, note) VALUES (?, ?, ?)",
        [req.user.id, req.params.id, req.body.note],
        () => res.send("Avis ajouté")
    );
});

router.post('/api/ouvrages/:id/commentaires', verifyToken, (req, res) => {

    db.query(
        "INSERT INTO commentaires (client_id, ouvrage_id, contenu, valide) VALUES (?, ?, ?, 0)",
        [req.user.id, req.params.id, req.body.contenu],
        () => res.send("Commentaire ajouté")
    );
});

router.put('/api/commentaires/:id/valider', verifyToken, (req, res) => {

    if (req.user.role !== "editeur") {
        return res.send("Refusé");
    }

    db.query(
        "UPDATE commentaires SET valide=1 WHERE id=?",
        [req.params.id],
        () => res.send("Validé")
    );
});
module.exports = router;

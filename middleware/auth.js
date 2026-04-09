const jwt = require('jsonwebtoken');

// middleware utilisateur
function verifyToken(req, res, next) {

    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token invalide' });
    }
}

// middleware admin
function auth(req, res, next) {

    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        req.user = decoded;
        next();

    } catch (err) {
        res.status(400).json({ message: 'Token invalide' });
    }
}

module.exports = { verifyToken, auth };

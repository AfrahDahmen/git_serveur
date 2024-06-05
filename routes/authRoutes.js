const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../db');

// {router.post('/signup', (req, res) => {
//     const { name, email, password } = req.body;

//     const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
//     const values = [name, email, password];
  
//     db.query(sql, values, (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Erreur interne du serveur" });
//       }
//       return res.status(200).json({ message: "Utilisateur enregistré avec succès" });
//     });
// });}

router.post('/login', [
  check('email', "Erreur de longueur de l'email").isEmail().isLength({ min: 10, max: 30 }),
  check('password', "Erreur de longueur du mot de passe 8-10").isLength({ min: 8, max: 20 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Une erreur s'est produite lors de la connexion." });
    }

    if (data.length > 0) {
      return res.status(200).json({ success: true, message: "Connexion réussie", userData: data[0] });
    } else {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    }
  });
});


module.exports = router;

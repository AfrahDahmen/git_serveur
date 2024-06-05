const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');

router.get('/client', (req, res) => {
    const sql = "SELECT * FROM client";
    db.query(sql, (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
  });
  
router.post('/createClient', (req, res) => {
    const sql = "INSERT INTO client (nom, prenom, NumTelephone, email, password) VALUES (?, ?, ?, ?, ?)";
    const values = [
      req.body.nom,
      req.body.prenom,
      req.body.NumTelephone,
      req.body.email,
      req.body.password
    ];
    db.query(sql, values, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur lors de l'ajout du client" });
      }
      return res.status(200).json({ message: "client ajouté avec succès" });
    });
  });


  router.get('/client/:id', (req, res) => {
    const clientId = req.params.id;
    const sql = "SELECT * FROM client WHERE ID = ?";
    db.query(sql, [clientId], (err, data) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails du client" });
      if (data.length === 0) return res.status(404).json({ error: "client non trouvé" });
      return res.json(data[0]);
    });
  });
  router.put('/updateClients/:id', (req, res) => {
    const clientId = req.params.id;
    const { nom, prenom, NumTelephone, email, password } = req.body;
  
    const sql = "UPDATE client SET nom = ?, prenom = ?, NumTelephone = ?, email = ?, password = ? WHERE ID = ?";
    const values = [nom, prenom, NumTelephone, email, password, clientId];
  
    db.query(sql, values, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur lors de la modification du client" });
      }
      return res.status(200).json({ message: "client modifié avec succès" });
    });
  });

router.delete('/deleteClients/:id', (req, res) => {
    const sql = "DELETE FROM client WHERE ID = ?";
    const id = req.params.id;
    db.query(sql, [id], (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
  });


  router.post('/signup', (req, res) => {
    const { nom, prenom, NumTelephone, email, password } = req.body;

    const sql = "INSERT INTO client (nom, prenom, NumTelephone, Email, password) VALUES (?, ?, ?, ?, ?)";    const values = [nom, prenom, NumTelephone, email, password];
  
    db.query(sql, values, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur interne du serveur" });
      }
      return res.status(200).json({ message: "Utilisateur enregistré avec succès" });
    });
});



router.post('/loginClient', [
  check('email', "Erreur de longueur de l'email").isEmail().isLength({ min: 10, max: 30 }),
  check('password', "Erreur de longueur du mot de passe 6-10").isLength({ min: 6, max: 20 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(errors);
  }

  const sql = "SELECT * FROM client WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      console.error(err);
      return res.json("Erreur");
    }

    if (data.length > 0) {
      return res.json("Succès");
    } else {
      return res.json("Échec");
    }
  });
});


module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');

router.get('/chauffeur', (req, res) => {
    const sql = "SELECT * FROM chauffeur";
    db.query(sql, (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
  });

router.get('/chauffeur/:id', (req, res) => {
    const chauffeurId = req.params.id;
    const sql = "SELECT * FROM chauffeur WHERE ID = ?";
    db.query(sql, [chauffeurId], (err, data) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails du chauffeur" });
      if (data.length === 0) return res.status(404).json({ error: "Chauffeur non trouvé" });
      return res.json(data[0]);
    });
  });

router.post('/create', (req, res) => {
    const sql = "INSERT INTO chauffeur (nom, prenom, NumTelephone, email, password) VALUES (?, ?, ?, ?, ?)";
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
        return res.status(500).json({ error: "Erreur lors de l'ajout du chauffeur" });
      }
      return res.status(200).json({ message: "Chauffeur ajouté avec succès" });
    });
  });

router.put('/updateChauffeurs/:id', (req, res) => {
    const chauffeurId = req.params.id;
    const { nom, prenom, NumTelephone, email, password } = req.body;
  
    const sql = "UPDATE chauffeur SET nom = ?, prenom = ?, NumTelephone = ?, email = ?, password = ? WHERE ID = ?";
    const values = [nom, prenom, NumTelephone, email, password, chauffeurId];
  
    db.query(sql, values, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur lors de la modification du chauffeur" });
      }
      return res.status(200).json({ message: "Chauffeur modifié avec succès" });
    });
  });

router.delete('/deletes/:id', (req, res) => {
    const sql = "DELETE FROM chauffeur WHERE ID = ?";
    const id = req.params.id;
    db.query(sql, [id], (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
  });


  router.post('/loginChauffeur', [
    check('email', "Erreur de longueur de l'email").isEmail().isLength({ min: 10, max: 30 }),
    check('password', "Erreur de longueur du mot de passe 6-10").isLength({ min: 6, max: 20 })
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
  
    const sql = "SELECT * FROM chauffeur WHERE email = ? AND password = ?";
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

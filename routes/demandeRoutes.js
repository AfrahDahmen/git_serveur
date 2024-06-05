const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');

router.get('/demandes', (req, res) => {
  const sql = "SELECT * FROM demande";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des demandes" });
    return res.json(data);
  });
});

router.get('/demande/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM demande WHERE userId = ?";
  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des demandes" });
    return res.json(data);
  });
});

router.get('/demande/:id', (req, res) => {
  const demandeId = req.params.id;
  const sql = "SELECT * FROM demande WHERE ID = ?";
  db.query(sql, [demandeId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails de la demande" });
    if (data.length === 0) return res.status(404).json({ error: "Demande non trouvée" });
    return res.json(data[0]);
  });
});



router.post('/envoyerDemande', async (req, res) => {
  try {
    const userId = req.body.userId;
    
    // Requête pour récupérer le nom et le prénom de l'utilisateur à partir de son ID
    const sqlUser = "SELECT id, nom, prenom FROM user WHERE id = ?";
    db.query(sqlUser, [userId], (errUser, resultUser) => {
      if (errUser || resultUser.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      const nom = resultUser[0].nom;
      const prenom = resultUser[0].prenom;
      const idUser = resultUser[0].id;

      // Requête pour insérer la nouvelle demande avec le nom et le prénom de l'utilisateur
      const sqlDemande = "INSERT INTO demande (userId, nom, prenom, NumTelephone, TypeVoiture, PositionVoiture, tempsEnvoi, heureRemorquage, etat) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, false)";
      const values = [
        userId,
        nom,
        prenom,
        req.body.NumTelephone,
        req.body.TypeVoiture,
        req.body.PositionVoiture,
        req.body.heureRemorquage
      ];

      db.query(sqlDemande, values, (errDemande, resultDemande) => {
        if (errDemande) {
          console.error(errDemande);
          return res.status(500).json({ error: "Erreur lors de l'envoi de la demande" });
        }

        const demandeId = resultDemande.insertId;
        return res.status(200).json({ message: "Demande envoyée avec succès", demandeId: demandeId, userId: idUser });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'envoi de la demande" });
  }
});


router.delete('/deleteDemande/:id', (req, res) => {
  const sql = "DELETE FROM demande WHERE ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});


router.get('/demande/details/:id', (req, res) => {
  const demandeId = req.params.id;
  const sql = "SELECT * FROM demande WHERE ID = ?";
  db.query(sql, [demandeId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails de la demande" });
    if (data.length === 0) return res.status(404).json({ error: "Demande non trouvée" });
    return res.json(data[0]);
  });
});


router.put('/demande/terminer/:id', (req, res) => {
  const demandeId = req.params.id;
  const sql = "UPDATE demande SET etat = 3 WHERE ID = ?"; // Etat 3 pour "Terminée"
  db.query(sql, [demandeId], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la demande" });
    }
    return res.status(200).json({ message: "Demande terminée avec succès" });
  });
});


module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');

router.get('/offres', (req, res) => {
  const sql = "SELECT * FROM offre";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des offres" });
    return res.json(data);
  });
});

router.get('/offre/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM offre WHERE userId = ?";
  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des offres" });
    return res.json(data);
  });
});

router.get('/offre/demande/:demandeId', (req, res) => {
  const demandeId = req.params.demandeId;
  console.log(`Fetching offers for demandeId: ${demandeId}`);
  
  const sql = "SELECT * FROM offre WHERE demandeId = ?";
  db.query(sql, [demandeId], (err, data) => {
    if (err) {
      console.error(`Error fetching offers: ${err}`);
      return res.status(500).json({ error: "Erreur lors de la récupération des offres" });
    }
    if (data.length === 0) {
      console.log('No offers found for this demande');
      return res.status(404).json({ error: "Aucune offre trouvée pour cette demande" });
    }
    console.log(`Offers found: ${JSON.stringify(data)}`);
    return res.json(data);
  });
});


router.get('/offre/:id', (req, res) => {
  const offreId = req.params.id;
  const sql = "SELECT * FROM offre WHERE ID = ?";
  db.query(sql, [offreId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails de la offre" });
    if (data.length === 0) return res.status(404).json({ error: "offre non trouvée" });
    return res.json(data[0]);
  });
});


// Route pour envoyer une offre
// Route pour envoyer une offre

router.post('/envoyerOffre/:demandeId', [
  body('duree').notEmpty().withMessage('La durée est obligatoire'),
  body('prix').notEmpty().withMessage('Le prix est obligatoire'),
  body('userId').notEmpty().withMessage("L'ID de l'utilisateur est obligatoire"),
], (req, res) => {
  // Validation des données de la requête
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Retourner les erreurs au format JSON
    return res.status(400).json({ errors: errors.array() });
  }

  // Récupération des données de la requête
  const { duree, prix, userId } = req.body;
  const demandeId = req.params.demandeId; // Récupération de l'ID de la demande depuis les paramètres d'URL

  // Requête pour récupérer les informations sur la demande
  const sqlDemande = "SELECT id FROM demande WHERE id = ?";
  db.query(sqlDemande, [demandeId], (err, resultDemande) => {
    if (err) {
      console.error('Erreur lors de la récupération de la demande :', err);
      return res.status(500).json({ error: "Erreur lors de la récupération de la demande", details: err.message });
    }

    if (resultDemande.length === 0) {
      return res.status(404).json({ error: "Demande non trouvée" });
    }

    // Requête pour récupérer le nom et le prénom de l'utilisateur à partir de son ID
    const sqlUser = "SELECT id, nom, prenom FROM user WHERE id = ?";
    db.query(sqlUser, [userId], (errUser, resultUser) => {
      if (errUser || resultUser.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      const nom = resultUser[0].nom;
      const prenom = resultUser[0].prenom;

      // Vérification si l'offre a déjà été envoyée par ce userId pour ce demandeId
      const sqlCheckOffre = "SELECT id FROM offre WHERE userid = ? AND demandeid = ?";
      db.query(sqlCheckOffre, [userId, demandeId], (err, resultCheckOffre) => {
        if (err) {
          console.error('Erreur lors de la vérification de l\'offre :', err);
          return res.status(500).json({ error: "Erreur lors de la vérification de l'offre", details: err.message });
        }

        if (resultCheckOffre.length > 0) {
          return res.status(409).json({ error: "Offre déjà envoyée pour cette demande par cet utilisateur" });
        }

        // Insérer l'offre dans la base de données avec l'état initial non accepté (0)
        const sqlInsert = "INSERT INTO offre (nom, prenom, duree, prix, tempsEnvoi, etat, userid, demandeid) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)";
        const values = [nom, prenom, duree, prix, 0, userId, demandeId]; // état initial = 0 (non accepté)
        db.query(sqlInsert, values, (err, resultOffre) => {
          if (err) {
            console.error('Erreur lors de l\'insertion de l\'offre :', err);
            return res.status(500).json({ error: "Erreur lors de l'insertion de l'offre", details: err.message });
          }

          // Récupérer l'ID de l'offre nouvellement créée
          const offreId = resultOffre.insertId;

          // Mettre à jour l'état de la demande associée à cette offre
          const sqlUpdateDemande = "UPDATE demande SET etat = 1 WHERE id = ?";
          db.query(sqlUpdateDemande, [demandeId], (err, resultUpdateDemande) => {
            if (err) {
              console.error('Erreur lors de la mise à jour de la demande :', err);
              return res.status(500).json({ error: "Erreur lors de la mise à jour de la demande", details: err.message });
            }

            // Retourner la réponse avec l'ID de l'offre
            return res.status(200).json({ message: "Offre envoyée avec succès", offreId, userId, demandeId });
          });
        });
      });
    });
  });
});



router.delete('/deleteOffre/:id', (req, res) => {
  const sql = "DELETE FROM offre WHERE ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});


// Route pour accepter une offre
// Route pour accepter une offre
router.put('/offre/accepter/:id', async (req, res) => {
  try {
    const offreId = req.params.id;
    const sql = "UPDATE offre SET etat = 1 WHERE ID = ?";
    await db.query(sql, [offreId]);

    // Mettre à jour l'état de la demande associée à cette offre
    const sqlUpdateDemande = "UPDATE demande SET etat = 2 WHERE id IN (SELECT demandeid FROM offre WHERE ID = ?)";
    await db.query(sqlUpdateDemande, [offreId]);

    return res.status(200).json({ message: "Offre acceptée avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'acceptation de l'offre", details: error.message });
  }
});


// Route pour supprimer une offre
router.delete('/supprimerOffre/:id', (req, res) => {
  const offreId = req.params.id;
  const sql = "DELETE FROM offre WHERE id = ?"; // Correction ici pour correspondre au frontend
  db.query(sql, [offreId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la suppression de l'offre" });
    return res.status(200).json({ message: "Offre supprimée avec succès" });
  });
});


router.get('/offre/demande/:demandeId/:userId', (req, res) => {
  const demandeId = req.params.demandeId;
  const userId = req.params.userId;
  
  const sql = "SELECT * FROM offre WHERE demandeId = ? AND userId = ?";
  db.query(sql, [demandeId, userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des offres" });
    if (data.length === 0) return res.status(404).json({ error: "Aucune offre trouvée pour cette demande par cet utilisateur" });
    return res.json(data);
  });
});




module.exports = router;

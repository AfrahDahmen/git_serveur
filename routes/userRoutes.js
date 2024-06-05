const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router(); // Utilisez express.Router() pour définir vos routes

// Importez votre configuration de base de données (db) ici

router.get('/user', (req, res) => {
    const sql = "SELECT * FROM user";
    db.query(sql, (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
});

router.get('/clients', (req, res) => {
    const sql = "SELECT * FROM user WHERE role = 'client'";
    db.query(sql, (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
});

router.get('/chauffeurs', (req, res) => {
    const sql = "SELECT * FROM user WHERE role = 'chauffeur'";
    db.query(sql, (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
});

router.post('/createUser', (req, res) => {
  let etat = 0; // par défaut, désactivé
  if (req.body.role === 'client') {
      etat = 1; // Si le rôle est client, activez le compte
  }

  const sql = "INSERT INTO user (nom, prenom, NumTelephone, email, password, role, etat) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    req.body.nom,
    req.body.prenom,
    req.body.NumTelephone,
    req.body.email,
    req.body.password,
    req.body.role,
    etat  // Utilisation de la variable 'etat' calculée ci-dessus
  ];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur lors de l'ajout du user" });
    }
    return res.status(200).json({ message: "user ajouté avec succès" });
  });
});




router.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM user WHERE ID = ?";
    db.query(sql, [userId], (err, data) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la récupération des détails du user" });
      if (data.length === 0) return res.status(404).json({ error: "user non trouvé" });
      return res.json(data[0]);
    });
});


router.put('/updateUser/:id', (req, res) => {
  const userId = req.params.id;
  const { nom, prenom, NumTelephone, email, password } = req.body;

  const sql = "UPDATE user SET nom = ?, prenom = ?, NumTelephone = ?, email = ?, password = ? WHERE ID = ?";
  const values = [nom, prenom, NumTelephone, email, password, userId];

  db.query(sql, values, (err, data) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erreur lors de la modification du profil" });
      }
      return res.status(200).json({ message: "Profil modifié avec succès" });
  });
});



router.delete('/deleteUser/:id', (req, res) => {
    const sql = "DELETE FROM user WHERE ID = ?";
    const id = req.params.id;
    db.query(sql, [id], (err, data) => {
      if (err) return res.json("Error");
      return res.json(data);
    });
});


router.post('/signupUser', (req, res) => {
  const { nom, prenom, NumTelephone, email, password, role } = req.body;

  let etat = 0; // par défaut, désactivé
  if (role.toLowerCase() === 'client') {
      etat = 1; // Si le rôle est client, activez le compte
  }

  const sql = "INSERT INTO user (nom, prenom, NumTelephone, Email, password, role, etat) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [nom, prenom, NumTelephone, email, password, role, etat];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    return res.status(200).json({ message: "Utilisateur enregistré avec succès" });
  });
});



router.post('/loginUser', [
  check('email', "Erreur de longueur de l'email").isEmail().isLength({ min: 10, max: 30 }),
  check('password', "Erreur de longueur du mot de passe 6-10").isLength({ min: 6, max: 20 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(errors);
  }

  const sql = "SELECT id, nom, prenom, NumTelephone, email, role, password FROM user WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      console.error(err);
      return res.json("Erreur");
    }

    if (data.length > 0) {
      const user = data[0];
      if (user.etat === 0) {
        return res.status(403).json({ message: "Accès refusé. Le compte n'est pas activé." });
      }

      const token = jwt.sign({ idUser: user.id }, 'votre_clé_secrète');
      // Inclure le champ password dans les données renvoyées
      return res.json({ id: user.id, token, role: user.role, nom: user.nom, prenom: user.prenom, NumTelephone: user.NumTelephone, email: user.email, password: user.password });
    } else {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  });
});





router.put('/updateClient/:id', (req, res) => {
  const clientId = req.params.id;
  const { nom, prenom, NumTelephone, email, password, etat } = req.body;

  const sql = "UPDATE user SET nom = ?, prenom = ?, NumTelephone = ?, email = ?, password = ?, etat = ? WHERE ID = ?";
  const values = [nom, prenom, NumTelephone, email, password, etat, clientId];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur lors de la modification du client" });
    }
    return res.status(200).json({ message: "Client modifié avec succès" });
  });
});

router.put('/updateChauffeur/:id', (req, res) => {
  const chauffeurId = req.params.id;
  const { nom, prenom, NumTelephone, email, password, etat } = req.body;

  const sql = "UPDATE user SET nom = ?, prenom = ?, NumTelephone = ?, email = ?, password = ?, etat = ? WHERE ID = ?";
  const values = [nom, prenom, NumTelephone, email, password, etat, chauffeurId];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur lors de la modification du chauffeur" });
    }
    return res.status(200).json({ message: "Chauffeur modifié avec succès" });
  });
});


router.delete('/delete/:id', (req, res) => {
  const sql = "DELETE FROM user WHERE ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});


router.delete('/deleteClient/:id', (req, res) => {
  const sql = "DELETE FROM user WHERE ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});


module.exports = router;

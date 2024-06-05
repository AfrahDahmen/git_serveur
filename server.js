
const authRoutes = require('./routes/authRoutes');
const chauffeurRoutes = require('./routes/chauffeurRoutes');
const clientRoutes = require('./routes/clientRoutes');
const demandeRoutes = require('./routes/demandeRoutes');
const offreRoutes = require('./routes/offreRoutes');
const userRoutes = require('./routes/userRoutes');


const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "remorquage"
});


app.use('/', authRoutes);
app.use('/', chauffeurRoutes);
app.use('/', clientRoutes);
app.use('/', demandeRoutes);
app.use('/', offreRoutes);
app.use('/', userRoutes);

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Le serveur fonctionne sur le port ${PORT}`);
});
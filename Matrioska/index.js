"use strict";

import express from "express";
import mongoose from "mongoose"; 
import methodOverride from "method-override"; 
import session from "express-session";
import MongoStore from "connect-mongodb-session";
import viewRoutes from "./routes/viewRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 

const app = express();
const MongoDBStore = MongoStore(session);

const mongoURI = "mongodb+srv://grupo8dbw:matrioska@matrioska.pdguue3.mongodb.net/MatrioskaDB?appName=Matrioska";

// Configurar armazenamento de sessões
const store = new MongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

// CONFIGURAÇÕES
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); 

// Configuração da Sessão
app.use(session({
    secret: "matrioska_secret_key_123", // Muda isto para algo seguro
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));

// Disponibilizar o utilizador para todos os ficheiros EJS automaticamente
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ROTAS 
app.use("/", viewRoutes);
app.use("/api/auth", authRoutes);

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Servidor a correr em http://localhost:${PORT}`);
        });
    })
    .catch((err) => console.log("Erro ao ligar ao MongoDB:", err));
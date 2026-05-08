"use strict";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import mongoose from "mongoose"; 
import methodOverride from "method-override"; 
import session from "express-session";
import MongoStore from "connect-mongodb-session";
import viewRoutes from "./routes/viewRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 

const app = express();
const MongoDBStore = MongoStore(session);

// Usa a variável do ficheiro .env
const mongoURI = process.env.MONGO_URI;
console.log("MONGO_URI:", mongoURI);

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
    secret: process.env.SESSION_SECRET, // Usa o secret do .env
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
        const PORT = process.env.PORT || 3000; // Usa a porta do .env ou 3000 por defeito
        app.listen(PORT, () => {
            console.log(`Servidor a correr em http://localhost:${PORT}`);
        });
    })
    .catch((err) => console.log("Erro ao ligar ao MongoDB:", err));
"use strict";

import session from "express-session";
import MongoStore from "connect-mongodb-session";

/**
 * Cria e devolve o middleware de sessão configurado com MongoDB como store.
 * Usa connect-mongodb-session para persistir sessões na base de dados,
 * evitando perder sessões ao reiniciar o servidor.
 */
const createSessionMiddleware = () => {
    const MongoDBStore = MongoStore(session);

    const store = new MongoDBStore({
        uri: process.env.MONGO_URI,
        collection: "sessions",
    });

    store.on("error", (err) => {
        console.error("Erro no MongoDB Session Store:", err);
    });

    return session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 horas
    });
};

export default createSessionMiddleware;

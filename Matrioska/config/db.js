"use strict";

import mongoose from "mongoose";

/**
 * Liga a aplicação ao MongoDB.
 * A URI é lida da variável de ambiente MONGO_URI definida no .env.
 */
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error("MONGO_URI não definida no ficheiro .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB ligado com sucesso.");
    } catch (err) {
        console.error("Erro ao ligar ao MongoDB:", err.message);
        process.exit(1);
    }
};

export default connectDB;

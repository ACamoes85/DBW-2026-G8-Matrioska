"use strict";

/**
 * Rate limiter simples em memória.
 * Limita o número de pedidos por chave (ex: userId:sala) dentro de uma janela de tempo.
 * Evita spam de tentativas de palavras ou pedidos duplicados.
 */

const rateLimits = new Map(); // chave → { count, resetAt }

const RATE_WINDOW_MS = 5000; // janela de 5 segundos
const RATE_MAX = 10;          // máximo de 10 pedidos por janela

/**
 * Verifica se a chave dada ultrapassou o limite de pedidos.
 *
 * @param {string} key - Identificador único (ex: "userId:codigoSala")
 * @returns {boolean} - true se bloqueado, false se permitido
 */
export function verificarRateLimit(key) {
    const agora = Date.now();
    let entrada = rateLimits.get(key);

    if (!entrada || agora > entrada.resetAt) {
        rateLimits.set(key, { count: 1, resetAt: agora + RATE_WINDOW_MS });
        return false; // permitido
    }

    entrada.count++;
    return entrada.count > RATE_MAX; // bloqueado se exceder o limite
}

// Remove entradas expiradas a cada minuto para não acumular memória indefinidamente
setInterval(() => {
    const agora = Date.now();
    for (const [key, val] of rateLimits.entries()) {
        if (agora > val.resetAt) rateLimits.delete(key);
    }
}, 60_000);

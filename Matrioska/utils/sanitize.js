"use strict";

/**
 * Sanitiza e valida um código de sala.
 * Aceita apenas letras maiúsculas e dígitos, entre 2 e 16 caracteres.
 *
 * @param {*} raw - Valor recebido do cliente
 * @returns {string|null} - Código limpo ou null se inválido
 */
export function sanitizarCodigo(raw) {
    if (typeof raw !== "string") return null;
    const limpo = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    return limpo.length >= 2 && limpo.length <= 16 ? limpo : null;
}

/**
 * Sanitiza uma tentativa de palavra enviada pelo jogador.
 * Aceita apenas letras (incluindo acentos portugueses), máx. 50 caracteres.
 *
 * @param {*} raw - Valor recebido do cliente
 * @returns {string|null} - Palavra limpa em maiúsculas ou null se inválida
 */
export function sanitizarPalavra(raw) {
    if (typeof raw !== "string") return null;
    const limpa = raw.trim().toUpperCase().replace(/[^A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/g, "");
    return limpa.length >= 1 && limpa.length <= 50 ? limpa : null;
}

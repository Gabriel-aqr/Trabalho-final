const bcrypt = require('bcrypt');
const saltRounds = 10; // Fator de custo para o hash. Ajuste conforme necessário.
const db = require('./db'); // Importa as funções de acesso ao banco (findUser, saveUser)

// --- A. FUNÇÕES DE HASHING (Nível de Segurança) ---

/**
 * Gera o hash seguro de um dado (CPF ou Senha).
 * @param {string} plainData O dado em texto puro.
 * @returns {Promise<string>} O hash com salt e custo embutidos.
 */
async function hashData(plainData) {
    // Garante que o input existe e é uma string antes de tentar o hash
    if (!plainData || typeof plainData !== 'string') {
        throw new Error('Dado inválido para hashing.');
    }
    return bcrypt.hash(plainData, saltRounds);
}

/**
 * Compara um dado em texto puro com um hash armazenado.
 * @param {string} plainData O dado digitado pelo usuário.
 * @param {string} storedHash O hash salvo no banco de dados.
 * @returns {Promise<boolean>} Retorna true se a comparação for bem-sucedida.
 */
async function compareData(plainData, storedHash) {
    if (!plainData || !storedHash) {
         return false;
    }
    return bcrypt.compare(plainData, storedHash);
}

// --- B. FUNÇÕES DE SERVIÇO (Lógica de Negócio) ---

/**
 * Registra um novo usuário no sistema.
 * @param {string} cpf O CPF em texto puro do usuário.
 * @param {string} senha A senha em texto puro do usuário.
 * @param {string} tipo O tipo de usuário (aluno ou professor).
 * @returns {Promise<Object>} Resultado do registro.
 */
async function registerUser(cpf, senha, tipo) {
    if (!cpf || !senha || !tipo) {
        throw new Error('Todos os campos são obrigatórios.');
    }

    // 1. Checa se o usuário (CPF + tipo) já existe
    const existingUser = await db.findUser(cpf, tipo);
    if (existingUser) {
        throw new Error('Usuário já cadastrado no sistema.');
    }

    // 2. Geração dos Hashes (O coração da segurança)
    const hashedCPF = await hashData(cpf);
    const hashedPassword = await hashData(senha);

    // 3. Salvamento no DB
    await db.saveUser(hashedCPF, hashedPassword, tipo);

    return { success: true, message: 'Cadastro realizado com sucesso.' };
}

/**
 * Autentica um usuário no sistema.
 * @param {string} cpf O CPF em texto puro digitado no login.
 * @param {string} senha A senha em texto puro digitada no login.
 * @param {string} tipo O tipo de usuário (aluno ou professor).
 * @returns {Promise<Object>} Objeto com status de autenticação e dados do usuário.
 */
async function authenticateUser(cpf, senha, tipo) {
    if (!cpf || !senha || !tipo) {
        // Credenciais inválidas (401)
        return { isAuthenticated: false, message: 'CPF, Senha e Tipo são obrigatórios.' };
    }

    // 1. Busca o usuário no DB pelo CPF e Tipo
    // NOTA: É importante que findUser seja capaz de buscar pelo CPF em texto puro
    // OU que você use um índice secundário no banco para a busca ser rápida.
    const user = await db.findUser(cpf, tipo); 

    if (!user) {
        // Mensagem genérica para segurança (não diz se o CPF existe ou não)
        return { isAuthenticated: false, message: 'Credenciais inválidas.' }; 
    }

    // 2. Comparação Dupla de Hashes (O processo de login)
    
    // a) Checa se o CPF digitado corresponde ao hash do CPF salvo
    const isCPFValid = await compareData(cpf, user.cpf_hash);
    
    // b) Checa se a Senha digitada corresponde ao hash da senha salvo
    const isPasswordValid = await compareData(senha, user.senha_hash);

    if (isCPFValid && isPasswordValid) {
        // Autenticação bem-sucedida
        // No mundo real, você geraria um token (JWT) aqui
        return { isAuthenticated: true, user: { id: user.id, tipo: user.tipo } };
    } else {
        // Falha na comparação
        return { isAuthenticated: false, message: 'Credenciais inválidas.' };
    }
}

module.exports = {
    registerUser,
    authenticateUser,
    // Exportamos também as funções de hash/compare para uso direto, se necessário
    hashData, 
    compareData
};
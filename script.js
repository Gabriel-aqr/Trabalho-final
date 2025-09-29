const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 1. Função para HASHING (Usada no Cadastro ou Atualização de Senha)
 * Gera um hash seguro da senha antes de ser armazenada.
 * * @param {string} plainPassword A senha em texto puro fornecida pelo usuário.
 * @returns {Promise<string>} O hash gerado que deve ser salvo no banco de dados.
 */
async function hashPassword(plainPassword) {
  try {
    // O bcrypt.hash() gera o salt e faz o hash em uma única chamada.
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    throw new Error('Falha no processo de segurança da senha.'); 
  }
}

/**
 * 2. Função para COMPARAÇÃO (Usada no Login)
 * Compara a senha digitada pelo usuário com o hash armazenado no banco.
 * * @param {string} plainPassword A senha em texto puro digitada no login.
 * @param {string} storedHash O hash salvo no seu banco de dados.
 * @returns {Promise<boolean>} Retorna true se as senhas coincidirem, false caso contrário.
 */
async function comparePassword(plainPassword, storedHash) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
    return false;
  }
}

// --- Exemplos de Uso ---

async function runExample() {
  const userPassword = 'senhaSuperSecreta123';
  
  console.log('--- Processo de Cadastro/Hash ---');
  
  // 1. Gerar o Hash e salvar no "banco de dados"
  const hashToStore = await hashPassword(userPassword);
  console.log(`Senha Original: ${userPassword}`);
  console.log(`Hash Gerado (para o DB): ${hashToStore}`);
  
  console.log('\n--- Processo de Login/Verificação ---');

  // Simulação de login com a senha CORRETA
  const correctPassword = userPassword;
  let isCorrect = await comparePassword(correctPassword, hashToStore);
  console.log(`Verificação com senha correta: ${isCorrect ? 'SUCESSO' : 'FALHA'}`); // Deve ser true
  
  // Simulação de login com a senha INCORRETA
  const wrongPassword = 'senhaErrada';
  let isIncorrect = await comparePassword(wrongPassword, hashToStore);
  console.log(`Verificação com senha incorreta: ${isIncorrect ? 'SUCESSO' : 'FALHA'}`); // Deve ser false
}

runExample();
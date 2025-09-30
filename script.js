const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 1. Função para HASHING (Usada no Cadastro ou Atualização)
 * Gera um hash seguro de qualquer dado em texto puro (Senha ou CPF de login).
 * @param {string} plainData O dado em texto puro fornecido pelo usuário (CPF ou Senha).
 * @returns {Promise<string>} O hash gerado que deve ser salvo no banco de dados.
 */
async function hashData(plainData) {
  try {
    // O bcrypt.hash() gera o salt e faz o hash em uma única chamada.
    const hashedData = await bcrypt.hash(plainData, saltRounds);
    return hashedData;
  } catch (error) {
    console.error('Erro ao gerar hash do dado:', error);
    throw new Error('Falha no processo de segurança de dados.'); 
  }
}

/**
 * 2. Função para COMPARAÇÃO (Usada no Login)
 * Compara o dado digitado pelo usuário com o hash armazenado no banco.
 * @param {string} plainData O dado em texto puro digitado no login (CPF ou Senha).
 * @param {string} storedHash O hash salvo no seu banco de dados.
 * @returns {Promise<boolean>} Retorna true se os dados coincidirem, false caso contrário.
 */
async function compareData(plainData, storedHash) {
  try {
    const isMatch = await bcrypt.compare(plainData, storedHash);
    return isMatch;
  } catch (error) {
    // Erro na comparação (ex: hash inválido, erro de biblioteca)
    console.error('Erro ao comparar dados:', error);
    return false;
  }
}

// --- EXEMPLOS DE USO ---

async function runExample() {
  const userCPF = '12345678900';
  const userPassword = 'senhaSuperSecreta123';
  
  console.log('--- Processo de Cadastro/Hashing ---');
  
  // 1. Gerar o Hash do CPF e da Senha
  const cpfHashToStore = await hashData(userCPF);
  const passwordHashToStore = await hashData(userPassword);

  console.log(`CPF Original: ${userCPF}`);
  console.log(`CPF Hash (para o DB): ${cpfHashToStore.substring(0, 30)}...`); // Exibe só o começo do hash
  console.log(`Senha Original: ${userPassword}`);
  console.log(`Senha Hash (para o DB): ${passwordHashToStore.substring(0, 30)}...`);
  
  console.log('\n--- Processo de Login/Verificação ---');

  // --- Simulação de Login com dados CORRETOS ---
  const correctCPF = userCPF;
  const correctPassword = userPassword;

  // VERIFICAÇÃO DO CPF
  const isCPFCorrect = await compareData(correctCPF, cpfHashToStore);
  // VERIFICAÇÃO DA SENHA
  const isPasswordCorrect = await compareData(correctPassword, passwordHashToStore);
  
  console.log('Tentativa 1: Login CORRETO');
  console.log(`CPF OK? ${isCPFCorrect}`);
  console.log(`Senha OK? ${isPasswordCorrect}`);
  console.log(`Status do Login: ${isCPFCorrect && isPasswordCorrect ? 'SUCESSO' : 'FALHA'}`); 

  console.log('\n----------------------------------------');

  // --- Simulação de Login com CPF INCORRETO ---
  const wrongCPF = '99988877766';
  
  const isWrongCPF = await compareData(wrongCPF, cpfHashToStore);
  
  console.log('Tentativa 2: CPF INCORRETO');
  console.log(`CPF OK? ${isWrongCPF}`); // Deve ser FALSE
  console.log(`Senha OK? ${isPasswordCorrect}`);
  console.log(`Status do Login: ${isWrongCPF && isPasswordCorrect ? 'SUCESSO' : 'FALHA'}`); // Deve ser FALHA
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  
  // Ouve o evento de envio do formulário
  form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Impede o envio tradicional (que recarrega a página)
      
      // 1. Coleta os dados em texto puro
      const cpf = document.getElementById('cpf').value;
      const senha = document.getElementById('senha').value;
      
      // Exemplo: Coleta o tipo de usuário selecionado
      const tipoAluno = document.getElementById('aluno').checked;
      const tipoProfessor = document.getElementById('professor').checked;

      // Determina o tipo de usuário para enviar ao backend
      const tipo = tipoAluno ? 'aluno' : (tipoProfessor ? 'professor' : null);

      if (!tipo) {
          alert('Selecione se é Aluno ou Professor.');
          return;
      }

      try {
          // 2. Envia os dados (CPF e Senha) em texto puro para o servidor
          const response = await fetch('/api/login', { // Este endpoint deve ser criado no seu Node.js
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ cpf, senha, tipo })
          });

          // 3. Trata a resposta do servidor
          if (response.ok) {
              // Login bem-sucedido
              const data = await response.json();
              alert('Login realizado com sucesso! Bem-vindo(a).');
              // Redireciona o usuário (ex: window.location.href = '/dashboard')
          } else {
              // Falha no login (CPF/Senha incorretos ou erro do servidor)
              const error = await response.json();
              alert('Falha no Login: ' + (error.message || 'CPF ou Senha inválidos.'));
          }
      } catch (error) {
          console.error('Erro na conexão:', error);
          alert('Erro ao tentar conectar com o servidor.');
      }
  });
});

runExample();
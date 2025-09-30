const express = require('express');
const app = express();
const { compareData } = require('./authService.js');

// 1. Importa o pool de conexões MySQL
const dbPool = require('./db');// O pool que você criou

// Middleware para processar JSON no corpo da requisição
app.use(express.json());

// Função de exemplo para buscar o usuário (simulando a função db.encontrarUsuarioPorCPF)
// **Você deve implementar essa função usando o pool!**
async function encontrarUsuarioPorCPF(cpf, tipo) {
    // Atenção à SEGURANÇA: Usamos Prepared Statements (o `?`) para evitar SQL Injection
    const [rows] = await dbPool.execute(
        'SELECT hashedCPF, hashedPassword, id FROM usuarios WHERE cpf_puro = ? AND tipo = ?',
        [cpf, tipo] // Os valores são passados como um array e substituem os `?`
    );

    // Se encontrou, retorna o primeiro usuário, senão retorna null
    return rows.length > 0 ? rows[0] : null;
}

// Endpoint para o processo de Login
app.post('/api/login', async (req, res) => {
    // 1. Recebe os dados em texto puro do frontend
    const { cpf, senha, tipo } = req.body; 

    // Validação básica
    if (!cpf || !senha || !tipo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 2. Busca o usuário no DB pelo CPF e pelo tipo (aluno/professor)
 
        // Aqui, você deve buscar o usuário pelo CPF para pegar o HASH SALVO
        const user = await encontrarUsuarioPorCPF(cpf, tipo); 

        if (!user) {
            // É uma boa prática não informar se o CPF ou a senha estão incorretos para evitar enumerar usuários
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 3. COMPARAÇÃO SEGURA (o coração da segurança!)
        // O compareData compara a senha/cpf digitado com os hashes SALVOS no DB
        const isCPFValid = await compareData(cpf, user.hashedCPF);
        const isPasswordValid = await compareData(senha, user.hashedPassword);

        if (isCPFValid && isPasswordValid) {
            // GERAÇÃO DE SESSÃO ou JWT para manter o usuário logado
            return res.status(200).json({ message: 'Login OK!', token: 'seu-token-jwt' });
        } else {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro de servidor durante o login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
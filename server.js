// server.js (Exemplo de uso das rotas)

const express = require('express');
const app = express();
const authService = require('./authService'); // Importa o serviço de autenticação

app.use(express.json());

// Rota de CADASTRO
app.post('/api/cadastro', async (req, res) => {
    try {
        const { cpf, senha, tipo } = req.body;
        
        // Chamada direta ao serviço
        await authService.registerUser(cpf, senha, tipo); 

        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        // Captura erros do serviço (ex: 'Usuário já cadastrado.')
        res.status(400).json({ message: error.message });
    }
});

// Rota de LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { cpf, senha, tipo } = req.body;
        
        // Chamada direta ao serviço
        const result = await authService.authenticateUser(cpf, senha, tipo); 

        if (result.isAuthenticated) {
            // Sucesso! Retorna o token ou dados do usuário
            return res.status(200).json({ message: 'Login OK!', user: result.user });
        } else {
            // Falha na autenticação (senha/cpf incorretos)
            return res.status(401).json({ message: result.message });
        }
    } catch (error) {
        console.error('Erro de servidor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
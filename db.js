const mysql = require('mysql2/promise'); // Usamos o /promise para async/await
require('dotenv').config(); // Para carregar variáveis de ambiente

// Configurações do seu banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',     // Seu host
    user: process.env.DB_USER || 'root',         // Seu usuário
    password: process.env.DB_PASSWORD || 'sua_senha', // Sua senha
    database: process.env.DB_DATABASE || 'seu_banco', // Seu banco de dados
    waitForConnections: true,
    connectionLimit: 10,  // Número máximo de conexões no pool
    queueLimit: 0         // 0 significa fila ilimitada
});

console.log('Pool de conexões MySQL criado.');

// Exporta o pool para que possa ser usado em outros arquivos
module.exports = pool;
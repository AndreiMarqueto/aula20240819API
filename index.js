const express = require('express');
const morgan = require('morgan');
const { swaggerUi, specs } = require('./swagger'); // Importe a configuração do Swagger
const app = express();
const port = 3000;

// Middleware para parsing de parâmetros de consulta
app.use(express.json());

// Configuração personalizada do morgan para incluir o IP do cliente
morgan.format('custom', ':remote-addr :method :url :status :response-time ms');
app.use(morgan('custom')); // Usa o formato personalizado para o log

// Rota para a documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint de cálculo
/**
 * @openapi
 * /calculate:
 *   get:
 *     summary: Realiza um cálculo simples
 *     parameters:
 *       - name: num1
 *         in: query
 *         description: Primeiro número
 *         required: true
 *         schema:
 *           type: number
 *       - name: num2
 *         in: query
 *         description: Segundo número
 *         required: true
 *         schema:
 *           type: number
 *       - name: operation
 *         in: query
 *         description: Operação matemática a ser realizada
 *         required: true
 *         schema:
 *           type: string
 *           enum: [+, -, x, /]  # Define os valores possíveis para operação
 *     responses:
 *       200:
 *         description: Resultado do cálculo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 *       400:
 *         description: Erro na solicitação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/calculate', (req, res, next) => {
    try {
        const { num1, num2, operation } = req.query;

        // Decodifica o parâmetro 'operation' para tratar caracteres especiais
        const decodedOperation = decodeURIComponent(operation).replace(/\s+/g, '+');

        // Verifica o valor do parâmetro 'operation' recebido
        console.log(`Received operation: '${operation}'`);
        console.log(`Decoded operation: '${decodedOperation}'`);

        // Verifica se todos os parâmetros estão presentes
        if (num1 === undefined || num2 === undefined || decodedOperation === undefined) {
            throw new Error('Parâmetros insuficientes!');
        }

        // Converte os parâmetros para números
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);

        // Verifica se os parâmetros são números válidos
        if (isNaN(number1) || isNaN(number2)) {
            throw new Error('Parâmetros inválidos!');
        }

        let result;

        // Realiza a operação baseada no parâmetro 'operation'
        switch (decodedOperation) {
            case '+':
                result = number1 + number2;
                break;
            case '-':
                result = number1 - number2;
                break;
            case 'x':
                result = number1 * number2;
                break;
            case '/':
                if (number2 === 0) {
                    throw new Error('Divisão por zero não é permitida!');
                }
                result = number1 / number2;
                break;
            default:
                throw new Error('Operação inválida!');
        }

        res.json({ result });
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack); // Log do erro
    res.status(400).json({ error: err.message }); // Responde com a mensagem de erro
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});
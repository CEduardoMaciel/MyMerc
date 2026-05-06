const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/produtos', (req, res) => {
    const produtos = [
        {
            nome: 'arroz',
            precos: {
                'Mercado A': 10.99,
                'Mercado B': 11.49
            }
        },
        {
            nome: 'feijão',
            precos: {
                'Mercado A': 8.49,
                'Mercado B': 8.99
            }
        },
        {
            nome: 'leite',
            precos: {
                'Mercado A': 4.29,
                'Mercado B': 4.59
            }
        }
    ]
    res.json(produtos)
})

const port = 3000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})
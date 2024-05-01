const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir requisições de qualquer origem
app.use(cors());

// Rota para buscar dados
app.get('/fetch-data', async (req, res) => {
    try {
        const { url } = req.query; // Espera-se que a URL venha como query param
        const response = await axios.get(url, {
            headers: {
						"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
						"Accept-Encoding": "gzip, deflate, br", // zstd não é comumente suportado em navegadores padrão, remova-o se estiver causando problemas
						"Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
						"Connection": "keep-alive",
						"Cookie": "PortalIOJoyRide=ridden; ASP.NET_SessionId=jfuh4fsc14vr1usugeiqimel; _gid=GA1.3.388108575.1714476614; _gat_gtag_UA_129106988_1=1; _ga_WFSES04T4S=GS1.1.1714524889.12.1.1714526450.25.0.0; _ga=GA1.1.906638006.1713916640",
						"Host": "www.imprensaoficial.com.br",
						"Referer": url,
						"Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
						"Sec-Ch-Ua-Mobile": "?0",
						"Sec-Ch-Ua-Platform": '"macOS"',
						"Sec-Fetch-Dest": "document",
						"Sec-Fetch-Mode": "navigate",
						"Sec-Fetch-Site": "same-origin",
						"Sec-Fetch-User": "?1",
						"Upgrade-Insecure-Requests": "1",
						"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
					},
					credentials: 'include'
        });

        // Enviar a resposta da API para o front-end
        res.send(response.data);
    } catch (error) {
        console.error('Erro ao fazer fetch:', error.message);
        res.status(500).send('Erro ao buscar dados');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

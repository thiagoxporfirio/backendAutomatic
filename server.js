const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto-js');
const cron = require('node-cron');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let tags = []

function Criptografa(text) {
    let encryptedValue = '';

    if (text !== '') {
        encryptedValue = crypto.MD5(text)
            .toString()
            .toUpperCase();
    }

    return encryptedValue;
}

const buildCompleteUrl = (startDate, endDate, keyword, currentPage) => {
	// Formata as datas para o formato AAAAMMDD
	const formattedStartDate = startDate.split("-").join("");
	const formattedEndDate = endDate.split("-").join("");

	const formatDateToBR = date => {
		const parts = date.split("-");
		return `${parts[2]}/${parts[1]}/${parts[0]}`;
	};

	const formatDateToBRPonto = date => {
		const parts = date.split("-");
		return `${parts[2]}.${parts[1]}.${parts[0]}`;
	};

	const formattedStartDateBR = formatDateToBR(selectedStartDate);
	const formattedEndDateBR = formatDateToBR(selectedEndDate);

	const formattedStartDateBRPonto = formatDateToBRPonto(selectedStartDate);
	const formattedEndDateBRPonto = formatDateToBRPonto(selectedEndDate);

	// Constrói a URL com os parâmetros substituídos
	const baseUrl = `https://www.imprensaoficial.com.br/DO/BuscaDO2001Resultado_11_3.aspx?filtropalavraschave=${keyword}&f=xhitlist&xhitlist_vpc=${currentPage}&xhitlist_x=Advanced&xhitlist_q=%5bfield+%27dc%3adatapubl%27%3a%3E%3d${formattedStartDateBRPonto}%3C%3d${formattedEndDateBRPonto}%5d(${keyword})&filtrogrupos=Todos%2c+Cidade+de+SP%2c+Editais+e+Leil%C3%B5es%2c+Empresarial%2c+Executivo%2c+Junta+Comercial%2c+DOU-Justi%C3%A7a%2c+Judici%C3%A1rio%2c+DJE%2c+Legislativo%2c+Municipios%2c+OAB%2c+Suplemento%2c+TRT+&xhitlist_mh=9999&filtrodatafimsalvar=${formattedEndDate}&filtroperiodo=${formattedStartDateBR}+a+${formattedEndDateBR}&filtrodatainiciosalvar=${formattedStartDate}&filtrogrupossalvar=Todos%2c+Cidade+de+SP%2c+Editais+e+Leil%C3%B5es%2c+Empresarial%2c+Executivo%2c+Junta+Comercial%2c+DOU-Justi%C3%A7a%2c+Judici%C3%A1rio%2c+DJE%2c+Legislativo%2c+Municipios%2c+OAB%2c+Suplemento%2c+TRT+&xhitlist_hc=%5bXML%5d%5bKwic%2c3%5d&xhitlist_vps=15&filtrotodosgrupos=True&xhitlist_d=Todos%2c+Cidade+de+SP%2c+Editais+e+Leil%C3%B5es%2c+Empresarial%2c+Executivo%2c+Junta+Comercial%2c+DOU-Justi%C3%A7a%2c+Judici%C3%A1rio%2c+DJE%2c+Legislativo%2c+Municipios%2c+OAB%2c+Suplemento%2c+TRT+&filtrotipopalavraschavesalvar=UP&xhitlist_s=&xhitlist_sel=title%3bField%3adc%3atamanho%3bField%3adc%3adatapubl%3bField%3adc%3acaderno%3bitem-bookmark%3bhit-context&xhitlist_xsl=xhitlist.xsl&navigators=`;

	// Retorna a URL completa
	return `${baseUrl}`;
};

const GetData = async (tags) => {
	selectedEndDate = new Date().toISOString().split("T")[0]
	selectedStartDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]
	if (!tags.length || !selectedStartDate || !selectedEndDate) return;
	
	let allResultsCombined = [];

		for (const tag of tags) {
			const url = buildCompleteUrl(
				selectedStartDate,
				selectedEndDate,
				tag.text,
				1
			);
	
				const response = await axios.get("http://77.37.69.49:3000/fetch-data", {
					params: {
						url: url
					}
				});
	
			const text = await response.data;
			const $ = cheerio.load(text);
			const cards = $('.resultadoBuscaItem');
		
			const cleanedCards = cards.map((index, card) => {
				const linkElement = $(card).find('.card-text a');
				let link = linkElement.attr('href') || '';
				link = link.startsWith('http') ? link : `https://www.imprensaoficial.com.br${link}`;
	
				return {
					header: $(card).find('.card-header').html(),
					body: $(card).find('.card-body').html(),
					link: link
				};
			}).get();
	
	
			allResultsCombined.push({
				cards:cleanedCards
			});
			
	
	}

		return allResultsCombined
};



//app.get('/email', async (req, res) => 
sendEmail = cron.schedule('00 15 * * *', async (req, res) => 
{ 
	try{
	const body = {
		"LOGIN": [
			{
				"USUARIO": "mestre", //o usuario que eu tenho que pegar deve ser o mesmo configurado para ser o padrão
				"ALIAS": "CORPORERM_TESTE",
				"SENHA": Criptografa("gestao"),
			}
		]
	}

	const API_AUTH_PASS = 'RCREST_API:RC@ABC123';
        const config = {
            method: 'post',
            url: `http://189.57.106.18:45556/LoginGlobal`,
            headers: {
                'Authorization': `Basic ${btoa(API_AUTH_PASS)}`,
                'ALIAS': "CORPORERM_TESTE",
                'HASH': "37D041301C4F952D83CD73",
            },
            data: body,
        }


		const resp = await axios(config);
        if (resp.status === 200) {
                if (resp.status === 200 && resp.data.CODIGO === '1')
                {
            
						const valoresSeparados = resp.data.PALAVRASCHAVE.split("|");
						const valoresComVirgula = valoresSeparados.join(", ");
						let tags =[]
						valoresSeparados.forEach(valor => {
							tags.push({ id: valor, text: valor });
						});

						let objects =  await GetData(tags)

						/*const transporter = nodemailer.createTransport({
						host: 'smtp.gmail.com',
						port: 	587, // Substitua pela porta adequada do seu provedor de e-mail
						secure: false, // true para SSL/TLS, false para outras conexões
						auth: {
							user: 'ti@riuma.com.br',
							pass: 'Mineracao10ti@RIUMA'
						}
						});*/

						const transporter = nodemailer.createTransport({
						host: 'smtp.office365.com',
						port: 	587, // Substitua pela porta adequada do seu provedor de e-mail
						secure: false, // true para SSL/TLS, false para outras conexões
						auth: {
							user: 'lisacs2002@hotmail.com',
							pass: 'B@tatadoce13'
						}
						});


						let body = '<p style="font-size: 18px; color: #333; font-weight: bold;"> Veja os Resultados para o diário Oficial hoje! </p> </br>';
						body += 'veja as informações para as suas palavras chaves: '+ valoresComVirgula +  ' </br>';
						if(objects == []){
							body += "Não há dados na busca de hoje!"
						}
						
						for (const object of objects){
							object.cards.map((card, index) => {
								body += `<div key="${index}" style="background-color: #f8f9fa; color: white; margin-bottom: 10px; padding:0px 0px 50px ; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">`;
								body += `<div style="background-color: #87cefa; color: white; padding: 10px; border-top-left-radius: 5px; border-top-right-radius: 5px;">${card.header}</div>`;
								body += `<div style="font-family: Arial, color:black; sans-serif; padding: 10px; margin:10px;">${card.body}</div>`;
								body += '<div style="justify-content: flex-end; background-color:#f8f9fa; float: right; padding: 10px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">';
								body += `<a href="${card.link}" style="text-decoration: none; background-color: #28a745; color: white; padding: 8px 12px; border-radius: 4px; transition: background-color 0.3s;">Certificar</a>`;
								body += '</div></div> </br>';
								
							})

							console.log("entrou")
						}

						console.log("saiu")

						// Tarefa agendada para enviar o e-mail todos os dias às 8h
						const mailOptions = {
							from: 'lisacs2002@hotmail.com',
							to: 'elisacds2002@gmail.com',
							subject: 'Diário Oficial',
							html: body
						};

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
							console.log('Erro ao enviar o e-mail:', error);
							} else {
							console.log('E-mail enviado:', info.response);
							}
						});
                }
                else
                {
                   console.log('Falha na validação da autorização da API.')
                }
            }
		}catch(error){
			console.error('Erro ao processar requisição:', error.message);
			return res.status(500).send('Erro interno ao processar requisição.');
		}
	return res.status(200).send('ok');
});


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


app.post('/fetch-data', async (req, res) => {
    try {
		const body = {
			"hdnTermoPesquisa": "pedra",
			"hdnTipoPesquisa": "E",
			"hdnVersaoDiario": "",
			"hdnOndePesquisa": "",
			"hdnTipoDataPesquisa": "",
			"hdnDataInicioPesquisa": "",
			"hdnDataFimPesquisa": "",
			"hdnTipoDocumentoPesquisa": "",
			"hdnVeiculoPublicacao": "",
			"hdnDataPublicacao": "",
			"hdnOrgaoFiltro": "",
			"hdnUnidadeResponsavelFiltro": "",
			"hdnTipoDocumentoFiltro": "",
			"hdnInicio": "0",
			"hdnVisualizacao": "L",
			"hdnModoPesquisa": "RAPIDA"
		  }
        const url  = 
		"https://diariooficial.prefeitura.sp.gov.br/md_epubli_controlador.php?acao=materias_pesquisar"
        const response = await axios.get(url, body ,{
            headers: {
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Accept-Language": "en-US,en;q=0.9",
				"Cache-Control": "max-age=0",
				"Connection": "keep-alive",
				"Content-Length": "327",
				"Content-Type": "application/x-www-form-urlencoded",
				"Cookie": "PHPSESSID=tua2pboqp8114al40h6a00ki0m; _ga_LC6GL9KCK4=GS1.1.1716147087.1.1.1716147116.0.0.0; _gid=GA1.4.627745989.1716147143; _ga=GA1.1.584967896.1715039132; _ga_TBRCVLQDNK=GS1.1.1716147142.2.0.1716147149.0.0.0; _ga_S44RKL6PKB=GS1.1.1716147143.2.0.1716147149.0.0.0; TS017e7eac=0181a10bc7f52d66a7d985eaa5ef6b782963aad32c3e6b8a042ba93d3b81172a8214bbb4d422c9c00a404725f08dfbc35475b6dcdb2e415d4c00b3a203df13b9d886ceed6d; TS3b4d9fc0077=083a958c66ab28002343f8d46edcf64989ce66ab91b732b28570ccb6a67fdb064fef3907bda3a6409a540ca9fe26d10008217664f71720007ddf8afa07ce6e78ae2ac1f9733e036d440a7d4b2dd20a8e6fdc9f1d68a87174; TSPD_101=083a958c66ab280025d750a031bcb3917fd0b9f774fcac138f05e2b6e2a842e6856d5a202db0ed6c31f4237f7c6b434a08f794fec60518007b381b785508d104b0670ecd9408ab774f29f86acc1fe506; TS9482b27c027=083a958c66ab200047e182dd58f7aca91ebfe8b219408792a1ac09eaed4a1dfb3044391f4f90787708287c8444113000ec3d1700096fa87d29cd9e8e3531a5ea4c4465988fa6c027cc9620f8c63b9b5d07bc806d89bc1ad5152ea9388f2eac2c; _ga_G0JTL7ZT1K=GS1.1.1716147195.2.1.1716147639.0.0.0",
				"Host": "diariooficial.prefeitura.sp.gov.br",
				"Origin": "https://diariooficial.prefeitura.sp.gov.br",
				"Referer": "https://diariooficial.prefeitura.sp.gov.br/md_epubli_controlador.php?acao=materias_pesquisar",
				"Sec-Ch-Ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
				"Sec-Ch-Ua-Mobile": "?1",
				"Sec-Ch-Ua-Platform": "\"Android\"",
				"Sec-Fetch-Dest": "document",
				"Sec-Fetch-Mode": "navigate",
				"Sec-Fetch-Site": "same-origin",
				"Sec-Fetch-User": "?1",
				"Upgrade-Insecure-Requests": "1",
				"User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
			
					}
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

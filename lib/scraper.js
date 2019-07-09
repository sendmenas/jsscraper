import cheerio from 'cheerio';
import fs from 'fs';
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const dbData = [];

const httpGet = url => {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

const getHTML = url => {
	return httpGet(url);
};

const getPageCount = html => {
	const data = cheerio.load(html);
	return getLastPage(data);
}

const parseAddress = addressStr => {
	const addressArr = addressStr.split(',').map(item => item.replace('/\r?\n|\r/g', '').trim());
	const addressObj = {
		Miestas: addressArr[0],
		Rajonas: addressArr[1],
		Gatve: addressArr[2],
		Dydis: addressArr[3]
	};

	return addressObj;
};

const parseDetails = data => {
	const detailsObj = {}
	const tags = [];
	const details = [];

	data('.obj-details dt').each(function () {
		tags.push(data(this).text().replace(':', '').trim());
	});

	data('.obj-details dd').each(function () {
		details.push(data(this).text().replace(/\s+/g, ' ').trim());
	});
	
	tags.forEach((item, i) => detailsObj[item] = details[i]);

	return detailsObj;
}

const parsePage = (html, url) => {
	const data = cheerio.load(html);
	const address = parseAddress(data('h1').text());
	const Kaina = data('.price-eur').text().replace(/\s|€/g, '').trim();
	const priceSqrM = data('.price-per').text().replace(/\(|\)|€\/m²|\s/g, '').trim();
	const details = parseDetails(data);
	const description = data('#collapsedText').text().replace(/\s+/g, ' ').trim();
	const parsedData = {
		url,
		Kaina,
		'Kaina už kvadratą': priceSqrM,
		...address,
		...details,
		'Aprašymas': description
	};

	dbData.push(parsedData);
}

const getLastPage = data => {
	const pages = 
		data('.pagination')
			.text()
			.replace(/\s+/g, ' ')
			.split(' ')
			.map(item => Number.parseInt(item))
			.filter(item => !isNaN(item));

  return pages[pages.length - 1];
}

const getLinks = html => {
	const adds = [];
	const data = cheerio.load(html);
	const list = data('.list-adress a').each(function () {
		adds.push(data(this).prop('href'));
	});
	return adds;
}

const getDate = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	return `${year}${month}${day}-${hours}${minutes}`;
}

const writeDataToFile = () => {
	const content = JSON.stringify(dbData, null, 2);
	const date = getDate();
	fs.writeFile(`${date}.json`, content, (err) => {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
};

export { getHTML, getPageCount, getLinks, parsePage, writeDataToFile };

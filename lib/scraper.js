import axios from 'axios';
import cheerio from 'cheerio';

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

const getHTML = async function (url) {
	const { data: html } = await axios.get(url);
	return html;
};

const parsePage = html => {
	const data = cheerio.load(html);
	const address = parseAddress(data('h1').text());
	const Kaina = data('.price-eur').text().replace(/\s|€/g, '').trim();
	const priceSqrM = data('.price-per').text().replace(/\(|\)|€\/m²|\s/g, '').trim();
	const details = parseDetails(data);
	const description = data('#collapsedText').text().replace(/\s+/g, ' ').trim();
	const parsedData = {
		Kaina,
		'Kaina už kvadratą': priceSqrM,
		...address,
		...details,
		'Aprašymas': description
	};
	console.log(parsedData);
	return parsedData;
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

const getPageCount = html => {
	const data = cheerio.load(html);
	return getLastPage(data);
}

const getLinks = html => {
	const adds = [];
	const data = cheerio.load(html);
	const list = data('.list-adress a').each(function () {
		adds.push(data(this).prop('href'));
	});
	return adds;
}

export { getHTML, getPageCount, getLinks, parsePage };

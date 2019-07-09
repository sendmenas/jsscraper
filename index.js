import { getHTML, getPageCount, getLinks, parsePage, writeDataToFile } from './lib/scraper'

const go = () => {
	const pages = getPageCount(getHTML('https://www.aruodas.lt/butai/vilniuje/'));

	const links = getLinks(getHTML('https://www.aruodas.lt/butai/vilniuje/'));
	for (let i = 0; i < links.length; i++) {
		console.log(`page 1, link ${i} of ${links.length - 1} - ${new Date()}`);
		parsePage(getHTML(links[i]), links[i]);
		if (i == links.length - 1) {
			getRest();
		}
	}
	getRest();
}

const getRest = () => {
	for (let j = 118; j < 128; j++) {
		const pageLinks = getLinks(getHTML(`https://www.aruodas.lt/butai/vilniuje/puslapis/${j}/`));
		// let j = 1;
		// const pageLinks = getLinks(getHTML(`https://www.aruodas.lt/butai/vilniuje/puslapis/55/`));
		for (let k = 0; k < pageLinks.length; k++) {
			console.log(`page ${j}, link ${k} of ${pageLinks.length - 1} - ${new Date()}`);
			parsePage(getHTML(pageLinks[k]), pageLinks[k]);
		}
	}
	writeDataToFile();
}

getRest();
// go();
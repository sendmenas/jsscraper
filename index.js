import { getHTML, getPageCount, getLinks, parsePage } from './lib/scraper'



async function go() {
	const pages = getPageCount(await getHTML('https://www.aruodas.lt/butai/vilniuje/'));
	const links = getLinks(await getHTML('https://www.aruodas.lt/butai/vilniuje/'));

	for (let i = 0; i < links.length; i++) {
		await parsePage(await getHTML(links[i]));
	}
}

go();
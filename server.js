const express = require('express');
const fetch = require('node-fetch');
const { firefox } = require('playwright');
const jsdom = require('jsdom');

const router = express.Router();
const app = express();

const port = 8000;

app.use(express.json());

app.use(express.static('F:/dev/Tamu CS hiring data/public/'));

router.get('/', (req, res) => {
    res.sendFile("F:/dev/Tamu CS hiring data/public/index.html");
});

async function getMajorData(request, browser, semester) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://aggiesurveys.tamu.edu/public/Reports.aspx');
    await page.selectOption('#ddlWHSemester', semester);

    await page.waitForLoadState('networkidle');
    await page.selectOption('#ddlWHCollege', request.body[0]);
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('#btnWHSelect')
    ]);
    await page.close();

    await newPage.waitForLoadState();

    console.log(await newPage.title());

    const dom = new jsdom.JSDOM(await newPage.content());
    let majorsData = Array.from(dom.window.document.querySelector("#resultstbl > tbody").children).map(e => e.id.match(/majorrepeater*/g) ? e.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerHTML.trim().replace("<b>Major: </b>", "").replace("&amp;", "&") : e.children[0].children[0]);
    return majorsData[majorsData.indexOf(request.body[1]) + 1];
}

router.post('/send', (request, response) => {
    (async() => {
        console.log(request.body);
        const browser = await firefox.launch();
        let majorData = await getMajorData(request, browser, "2019C");

        console.log(Array.from(majorData.children[0].children).map(el => Array.from(el.children).map(ele => ele.innerHTML)));

        response.set('Content-Type', 'text/html');
        response.send(true);
        //response.end("yes");
        //await new Promise(r => setTimeout(r, 100));
        await browser.close();
    })();

});

app.use('/', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});
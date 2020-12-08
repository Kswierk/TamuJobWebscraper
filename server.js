const express = require('express');
const fetch = require('node-fetch');
const { firefox } = require('playwright');
const jsdom = require('jsdom');

const router = express.Router();
const app = express();

const port = 8000;

const letToSemester = {
    "A": "Spring",
    "B": "Summer",
    "C": "Fall"
}

let flatCache = require('flat-cache');
let cache = flatCache.load('server');

app.use(express.json());

app.use(express.static('F:/dev/Tamu CS hiring data/public/'));

router.get('/', (req, res) => {
    res.sendFile("F:/dev/Tamu CS hiring data/public/index.html");
});

async function getYearDataForMajor(browser, request, sem) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://aggiesurveys.tamu.edu/public/Reports.aspx');
    await Promise.all([
        page.selectOption('#ddlWHSemester', sem),
        page.waitForNavigation({ waitUntil: 'load' })
    ]);
    //await new Promise(r => setTimeout(r, 2000));

    let val = await page.selectOption('#ddlWHCollege', request.body[0]);
    if (val.length == 0) {
        await page.selectOption('#ddlWHCollege', request.body[0] + " ");
    }

    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('#btnWHSelect')
    ]);
    await page.close();

    await newPage.waitForLoadState();

    console.log(await newPage.title());

    const dom = new jsdom.JSDOM(await newPage.content());
    let majorsData = Array.from(dom.window.document.querySelector("#resultstbl > tbody").children).map(e => e.id.match(/majorrepeater*/g) ? e.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerHTML.trim().replace("<b>Major: </b>", "").replace("&amp;", "&") : e.children[0].children[0]);
    let majorTable = majorsData[majorsData.indexOf(request.body[1]) + 1];
    let majorData = Array.from(majorTable.children[0].children).slice(1, -1).map(el => Array.from(el.children).concat([sem.substr(0, 4) + " " + letToSemester[sem.slice(-1)]]).map((ele, i) => i > 1 ? ele : ele.innerHTML));
    await newPage.close();
    await context.close();
    return majorData;
}

async function getMajorData(request, browser) {


    let htmlResp = await (await fetch("https://aggiesurveys.tamu.edu/public/Reports.aspx")).text();
    const dom = new jsdom.JSDOM(htmlResp);
    let semesters = Array.from(dom.window.document.querySelector("#ddlWHSemester").children).map(el => el.value).slice(1);
    let majorData = [];
    let temp = [];
    let threads = 18;
    while (semesters.length > 0) {
        temp = semesters.splice(0, threads);
        console.log(temp);
        (await Promise.all(temp.map(el => getYearDataForMajor(browser, request, el)))).forEach(e => majorData.push(...e));
    }

    return majorData;
}

router.post('/send', (request, response) => {
    (async() => {
        console.log(request.body);
        if (cache.getKey(request.body) !== undefined) {
            response.set('Content-Type', 'text/html');
            response.send(cache.getKey(request.body));
            return;
        }
        const browser = await firefox.launch();
        let majorData = await getMajorData(request, browser);

        cache.setKey(request.body, majorData);
        cache.save();
        response.set('Content-Type', 'text/html');
        response.send(majorData);
        //await new Promise(r => setTimeout(r, 100));
        await browser.close();
    })();

});

app.use('/', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});
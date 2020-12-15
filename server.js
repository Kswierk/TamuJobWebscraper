const express = require('express');
const fetch = require('node-fetch');
const { webkit } = require('playwright-webkit');
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

app.use(express.static(__dirname + '/public'));

router.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
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

    let val = await page.selectOption('#ddlWHCollege', request[0]);
    if (val.length == 0) {
        val = await page.selectOption('#ddlWHCollege', request[0] + " ");
    }
    if (val.length == 0) {
        throw ("cant find college");
    }

    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('#btnWHSelect')
    ]);
    await page.close();

    await newPage.waitForLoadState();

    console.log(await newPage.title());

    const dom = new jsdom.JSDOM(await newPage.content());
    //array alternating from major name to a html table of jobs
    let majorsData = Array.from(dom.window.document.querySelector("#resultstbl > tbody").children).map(e => e.id.match(/majorrepeater*/g) ? e.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerHTML.trim().replace("<b>Major: </b>", "").replace("&amp;", "&") : e.children[0].children[0]);
    //returns html table of the major
    if (majorsData.indexOf(request[1]) == -1) //return empty array if it can't find it
        return [
        []
    ];
    let majorTable = majorsData[majorsData.indexOf(request[1]) + 1];
    //makes 2d array out of table
    let majorData = Array.from(majorTable.children[0].children).slice(1, -1).map(el => Array.from(el.children).concat([sem.substr(0, 4) + " " + letToSemester[sem.slice(-1)]]).map((ele, i) => i > 1 ? ele : ele.innerHTML == "" ? "(Blank)" : ele.innerHTML));
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
        try {
            (await Promise.all(temp.map(el => getYearDataForMajor(browser, request, el)))).forEach(e => majorData.push(...e));
        } catch (e) {
            throw (e);
        }

    }

    return majorData;
}

router.post('/send', (request, response) => {
    let reqbody = [];
    reqbody.push(request.body[0].replace(/[^A-Za-z0-9&-./, ]/g, ""));
    reqbody.push(request.body[1].replace(/[^A-Za-z0-9&-./, ]/g, ""));
    let majorData = [
        [""]
    ];
    (async() => {
        console.log(reqbody);
        if (cache.getKey(reqbody) !== undefined) {
            response.set('Content-Type', 'text/html');
            response.send(cache.getKey(reqbody));
            return;
        }
        const browser = await webkit.launch();
        try {
            majorData = await getMajorData(reqbody, browser);
        } catch (e) {
            console.log(e);
            response.set('Content-Type', 'text/plain');
            response.send(e);
            return;
        }
        let notempty = false;
        for (let i = 0; i < majorData.length; i++) {
            if (majorData[i].length != 0) {
                notempty = true;
            }
        }
        if (!notempty) {
            response.set('Content-Type', 'text/plain');
            response.send("Can't find major");
            return;
        }
        cache.setKey(reqbody, majorData);
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
let companyclicked = false;
let jobclicked = false;
let yearclicked = false;
let table = [];
let modifiedTable = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn").addEventListener("click", (async() => {
        console.log("pressed?");
        let postdata = [];
        document.getElementById("btn").disabled = true;
        document.querySelectorAll(".entry").forEach(e => postdata.push(e.value));
        let res = await fetch("http://localhost:8000/send", {
            method: 'post',
            body: JSON.stringify(postdata),
            headers: { 'content-type': 'application/json' }
        });
        document.getElementById("btn").disabled = false;
        let res2 = res.clone();
        let textValue = await res.text();
        if (textValue.includes("[")) {
            console.log(textValue)
            handleResponse(await res2.json());
        } else {
            document.getElementById("tableContainer").innerHTML = `<p style="color: red">${textValue}</p>`
        }
    }));
    document.getElementById("removeDupe").checked = false;
});

function addEventListeners() {
    document.getElementById("companyHeader").addEventListener("click", handleCompanyClick);
    document.getElementById("jobHeader").addEventListener("click", handleJobClick);
    document.getElementById("yearHeader").addEventListener("click", handleYearClick);
}

function handleResponse(res) {

    document.getElementById("jobSearchContainer").hidden = false;

    table = res;
    modifiedTable = [...res];
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);

    addEventListeners();
    document.getElementById("jobSearch").addEventListener("input", e => {
        handleJobSearch(e.target.value, table);
        if (document.getElementById('removeDupe').checked) {
            removeDupes();
        }
        document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);
        addEventListeners();
    });
    document.getElementById("removeDupe").addEventListener("click", handleDupeClick);
}

function removeDupes() {
    let freq = {};
    let temp = "";
    for (let i = 0; i < modifiedTable.length; i++) {
        temp = modifiedTable[i][0].trim().toLowerCase().replace(/[^a-z0-9]/g);
        if (temp in freq) {
            freq[temp]++;
            modifiedTable.splice(i, 1);
            i--;
        } else {
            freq[temp] = 1;
        }
    }
}

function handleDupeClick() {
    if (!document.getElementById('removeDupe').checked) {
        handleJobSearch(document.getElementById("jobSearch").value, table);
        document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);
        addEventListeners();
        return;
    }
    console.log("not in if loop");
    removeDupes();
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);
    addEventListeners();
}

function handleYearClick() {
    function abysort(a, b) {
        let arrA = a[2].split(" ");
        let arrB = b[2].split(" ");
        let semObj = {
            "Fall": 2,
            "Summer": 1,
            "Spring": 0
        }
        let result = 0;
        if (arrA[0] == arrB[0]) {
            result = semObj[arrA[1]] < semObj[arrB[1]] ? -1 : semObj[arrA[1]] > semObj[arrB[1]];
        } else {
            result = parseInt(arrA[0]) < parseInt(arrB[0]) ? -1 : parseInt(arrA[0]) > parseInt(arrB[0]);
        }
        return yearclicked ? result : result * -1;
    }
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable.sort((a, b) => abysort(a, b)));
    table.sort(abysort);
    addEventListeners();
    yearclicked = !yearclicked;
    jobclicked = false;
    companyclicked = false;
}

function absort(a, b, tf) {
    let result = b < a ? -1 : b > a;
    return tf ? result : result * -1;
}

function handleJobClick() {
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable.sort((a, b) => absort(a[1].toLowerCase(), b[1].toLowerCase(), jobclicked)));
    table.sort((a, b) => absort(a[1].toLowerCase(), b[1].toLowerCase(), jobclicked));
    addEventListeners();
    jobclicked = !jobclicked;
    yearclicked = false;
    companyclicked = false;
}

function handleCompanyClick() {

    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable.sort((a, b) => absort(a[0].toLowerCase(), b[0].toLowerCase(), companyclicked)));
    table.sort((a, b) => absort(a[0].toLowerCase(), b[0].toLowerCase(), companyclicked));
    addEventListeners();
    jobclicked = false;
    yearclicked = false;
    companyclicked = !companyclicked;
}

function handleJobSearch(inputString, array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i][1].toLowerCase().includes(inputString.toLowerCase())) {
            newArray.push(array[i]);
        }
    }
    modifiedTable = [...newArray];
}

function makeTableHTML(ar) {
    return `<table><thead><th id="companyHeader">Company</th><th id="jobHeader">Job type</th><th id="yearHeader">Year</th></thead>${ar.reduce((c, o) => c += `<tr>${o.reduce((c, d) => (c += `<td>${d}</td>`), '')}</tr>`, '')}</table>`;
}
let companyclicked = false;
let jobclicked = false;
let yearclicked = false;
let table = [];
let modifiedTable = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn").addEventListener("click", () => {
        let postdata = [];
        document.getElementById("btn").disabled = true;
        document.querySelectorAll(".entry").forEach(e => postdata.push(e.value));
        fetch("http://localhost:8000/send", {
                method: 'post',
                body: JSON.stringify(postdata),
                headers: { 'content-type': 'application/json' }
            }).then(r => r.json())
            .then(res => handleResponse(res));
    });
    document.getElementById("removeDupe").checked = false;
});

function addEventListeners() {
    document.getElementById("companyHeader").addEventListener("click", handleCompanyClick);
    document.getElementById("jobHeader").addEventListener("click", handleJobClick);
    document.getElementById("yearHeader").addEventListener("click", handleYearClick);
}

function handleResponse(res) {
    document.getElementById("btn").disabled = false;
    document.getElementById("jobSearchContainer").hidden = false;

    table = res;
    modifiedTable = [...res];
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);

    addEventListeners();
    document.getElementById("jobSearch").addEventListener("input", e => {
        modifiedTable = handleJobSearch(e.target.value, table);
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
        modifiedTable = handleJobSearch(document.getElementById("jobSearch").value, table);
        document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);
        addEventListeners();
        return;
    }
    removeDupes();
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable);
    addEventListeners();
}

function handleYearClick() {
    function abysort(a, b) {
        if (!yearclicked)
            return b[2] < a[2] ? -1 : b[2] > a[2];
        return a[2] < b[2] ? -1 : a[2] > b[2];
    }
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedTable.sort((a, b) => abysort(a, b)));
    table.sort(abysort);
    addEventListeners();
    yearclicked = !yearclicked;
    jobclicked = false;
    companyclicked = false;
}

function absort(a, b, tf) {
    if (tf)
        return b < a ? -1 : b > a;
    return a < b ? -1 : a > b;
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
    return newArray;
}

function makeTableHTML(ar) {
    return `<table><thead><th id="companyHeader">Company</th><th id="jobHeader">Job type</th><th id="yearHeader">Year</th></thead>${ar.reduce((c, o) => c += `<tr>${o.reduce((c, d) => (c += `<td>${d}</td>`), '')}</tr>`, '')}</table>`;
}
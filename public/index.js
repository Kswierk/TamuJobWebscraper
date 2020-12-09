let companyclicked = false;
let jobclicked = false;
let yearclicked = false;

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
});

function addEventListeners(res) {
    document.getElementById("companyHeader").addEventListener("click", () => handleCompanyClick(res));
    document.getElementById("jobHeader").addEventListener("click", () => handleJobClick(res));
    document.getElementById("yearHeader").addEventListener("click", () => handleYearClick(res));
}

function handleResponse(res) {
    document.getElementById("btn").disabled = false;
    document.getElementById("jobSearchContainer").hidden = false;

    let modifiedRes = [...res];
    document.getElementById("jobSearch").addEventListener("input", e => {
        modifiedRes = handleJobSearch(e.target.value, res);
        document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedRes);
    });
    document.getElementById("tableContainer").innerHTML = makeTableHTML(modifiedRes);

    addEventListeners(res);
}

function handleYearClick(res) {
    document.getElementById("tableContainer").innerHTML = makeTableHTML(res.sort((a, b) => {
        if (!yearclicked)
            return b[2] < a[2] ? -1 : b[2] > a[2];
        return a[2] < b[2] ? -1 : a[2] > b[2];
    }));
    addEventListeners(res);
    yearclicked = !yearclicked;
    jobclicked = false;
    companyclicked = false;
}

function handleJobClick(res) {
    console.log("jobclick");
    document.getElementById("tableContainer").innerHTML = makeTableHTML(res.sort((a, b) => {
        if (jobclicked)
            return b[1].toLowerCase() < a[1].toLowerCase() ? -1 : b[1].toLowerCase() > a[1].toLowerCase();
        return a[1].toLowerCase() < b[1].toLowerCase() ? -1 : a[1].toLowerCase() > b[1].toLowerCase();
    }));
    addEventListeners(res);
    jobclicked = !jobclicked;
    yearclicked = false;
    companyclicked = false;
}

function handleCompanyClick(res) {
    console.log("companyclick");
    document.getElementById("tableContainer").innerHTML = makeTableHTML(res.sort((a, b) => {
        if (companyclicked)
            return b[0].toLowerCase() < a[0].toLowerCase() ? -1 : b[0].toLowerCase() > a[0].toLowerCase();
        return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : a[0].toLowerCase() > b[0].toLowerCase();
    }));
    addEventListeners(res);
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
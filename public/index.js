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

function handleResponse(res) {
    document.getElementById("btn").disabled = false;

    document.getElementById("tableContainer").innerHTML = makeTableHTML(res);
}

function makeTableHTML(ar) {
    return `<table><thead><th>Company</th><th>Job type</th><th>Year</th></thead>${ar.reduce((c, o) => c += `<tr>${o.reduce((c, d) => (c += `<td>${d}</td>`), '')}</tr>`, '')}</table>`;
}
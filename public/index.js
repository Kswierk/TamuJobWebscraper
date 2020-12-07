document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn").addEventListener("click", () => {
        let postdata = [];
        document.getElementById("btn").disabled = true;
        document.querySelectorAll(".entry").forEach(e => postdata.push(e.value));
        fetch("http://localhost:8000/send", {
                method: 'post',
                body: JSON.stringify(postdata),
                headers: { 'content-type': 'application/json' }
            }).then(r => r.text())
            .then(res => handleResponse(res));
        /*
        Array.from(document.querySelectorAll("tr")).forEach(e => e.id.match(/major*) ? console.log(e.children[0].children[0].children[0].children[0].children[0].innerText) : "");
        console.log(typeof(document.querySelector("#resultstbl > tbody")))
        .children).map(e => e.id.match(/majorrepeater*g) ? e.children[0].children[0].children[0].children[0].children[0].innerText : e.children[0].children[0]);
        let domparser = new DOMParser();
        let doc = domparser.parseFromString(await page.innerHTML(), "text/html");
        console.log(doc.querySelector("#resultsbl > tbody"));
        */
    });
});

function handleResponse(res) {
    document.getElementById("btn").disabled = false;
    let domparser = new DOMParser();
    //let doc = domparser.parseFromString(res, "text/html");
    //let majorsData = Array.from(doc.querySelector("#resultstbl > tbody").children).map(e => e.id.match(/majorrepeater*/g) ? e.children[0].children[0].children[0].children[0].children[0].innerText.trim() : e.children[0].children[0]);

    //use jsdom in the backend so we can group all of the major together and send it all back. 
    //console.log(majors[majors.findIndex(str => str.includes(document.querySelector(".entry").value))]);
    //document.getElementById("tableContainer").appendChild(majors[majors.indexOf(document.querySelector(".entry").value) + 1]);
    console.log(res);
}
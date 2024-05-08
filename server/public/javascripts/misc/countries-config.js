const xhttp = new XMLHttpRequest();
const select = document.getElementById("countries");
const flag = document.getElementById("flag");

let countries;

xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        countries = JSON.parse(xhttp.responseText);
        assignValues();
        handleCountryChange();
    }
};

xhttp.open("GET", "https://restcountries.com/v3.1/all?fields=name,flags", true);
xhttp.send();

function assignValues() {
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.cca2;
        option.textContent = country.name.common;
        select.appendChild(option);
    });
}

function handleCountryChange() {
    const countryData = countries.find(
        country => select.value === country.cca2
    );
    flag.style.backgroundImage = `url(${countryData.flags.png})`;
}

select.addEventListener("change", handleCountryChange.bind(this));
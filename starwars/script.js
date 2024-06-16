// Skapa två cache-objekt för att lagra hämtad data.
const peopleCache = new Map();
const planetCache = new Map();

// Ladda data från localStorage när sidan laddas
window.onload = function() {
    loadFromLocalStorage();
};

// Lägg till händelsehanterare för knappar och sökfältet.
document.getElementById('search-button').addEventListener('click', search);
document.getElementById('random-button').addEventListener('click', fetchRandomCharacter);
document.getElementById('search-input').addEventListener('keydown', function(event) {
    // Om användaren trycker på Enter, kör sökfunktionen.
    if (event.key === 'Enter') {
        search();
    }
});

// Huvudfunktionen för att hantera sökningar.
async function search() {
    const query = document.getElementById('search-input').value.trim();
    if (query === '') return; // Om sökfältet är tomt, gör ingenting
    document.getElementById('results').innerHTML = ''; // Rensa tidigare sökresultat
    await searchPeople(query); // Sök efter människor
    await searchPlanets(query); // Sök efter planeter
    saveToLocalStorage(); // Spara cache-data till localStorage
}

// Funktion för att söka efter människor.
async function searchPeople(query) {
    if (peopleCache.has(query)) {
        // Om sökningen redan finns i cachen, använd cachen
        await displayResults(peopleCache.get(query), 'people');
        return;
    }

    try {
        // Hämta data från API.
        const response = await fetch(`https://swapi.dev/api/people/?search=${query}`);
        const data = await response.json();
        peopleCache.set(query, data.results); // Spara resultatet i cachen
        await displayResults(data.results, 'people');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Funktion för att söka efter planeter.
async function searchPlanets(query) {
    if (planetCache.has(query)) {
        // Om sökningen redan finns i cachen, använd cachen.
        await displayResults(planetCache.get(query), 'planets');
        return;
    }

    try {
        // Hämta data från API.
        const response = await fetch(`https://swapi.dev/api/planets/?search=${query}`);
        const data = await response.json();
        planetCache.set(query, data.results); // Spara resultatet i cachen.
        await displayResults(data.results, 'planets');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Funktion för att visa result på sidan.
async function displayResults(results, type) {
    const resultsDiv = document.getElementById('results');
    
    results.forEach(async (result) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        if (type === 'people') {
            // Om det är en person, hämta hemvärlden och visa info.
            const homeworld = await fetchHomeworld(result.homeworld);
            resultItem.innerHTML = `
                <p><strong>Name:</strong> ${result.name}</p>
                <p><strong>Height:</strong> ${result.height} cm</p>
                <p><strong>Mass:</strong> ${result.mass} kg</p>
                <p><strong>Hair Color:</strong> ${result.hair_color}</p>
                <p><strong>Skin Color:</strong> ${result.skin_color}</p>
                <p><strong>Eye Color:</strong> ${result.eye_color}</p>
                <p><strong>Birth Year:</strong> ${result.birth_year}</p>
                <p><strong>Gender:</strong> ${result.gender}</p>
                <p><strong>Homeworld:</strong> ${homeworld}</p>
            `;
        } else if (type === 'planets') {
            // Om det är en planet, visa planetinfo.
            resultItem.innerHTML = `
                <p><strong>Name:</strong> ${result.name}</p>
                <p><strong>Rotation Period:</strong> ${result.rotation_period}</p>
                <p><strong>Orbital Period:</strong> ${result.orbital_period}</p>
                <p><strong>Diameter:</strong> ${result.diameter}</p>
                <p><strong>Climate:</strong> ${result.climate}</p>
                <p><strong>Gravity:</strong> ${result.gravity}</p>
                <p><strong>Terrain:</strong> ${result.terrain}</p>
                <p><strong>Population:</strong> ${result.population}</p>
            `;
        }

        resultsDiv.appendChild(resultItem);
    });
}

// Funktion för att hämta hemvärlden för en person.
async function fetchHomeworld(url) {
    if (planetCache.has(url)) {
        return planetCache.get(url).name;
    }

    try {
        // Hämta data från API.
        const response = await fetch(url);
        const data = await response.json();
        planetCache.set(url, data); // Spara resultatet i cache.
        saveToLocalStorage(); // Spara cache-data till localStorage.
        return data.name;
    } catch (error) {
        console.error('Error fetching homeworld:', error);
        return 'Unknown';
    }
}

// Funktion för att slumpa en karaktär.
async function fetchRandomCharacter() {
    try {
        // Hämta totalt antal karaktärer.
        const countResponse = await fetch('https://swapi.dev/api/people/');
        const countData = await countResponse.json();
        const totalCharacters = countData.count;

        // Generera ett slumpmässigt ID.
        const randomId = Math.floor(Math.random() * totalCharacters) + 1;

        // Hämta data för slumpmässig karaktär.
        const response = await fetch(`https://swapi.dev/api/people/${randomId}/`);
        const character = await response.json();

        // Hämta hemvärlden för karaktären.
        const homeworld = await fetchHomeworld(character.homeworld);

        // Visa den slumpmässiga karaktären på sidan.
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ''; // Rensa tidigare resultat.
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        resultItem.innerHTML = `
            <p><strong>Name:</strong> ${character.name}</p>
            <p><strong>Height:</strong> ${character.height} cm</p>
            <p><strong>Mass:</strong> ${character.mass} kg</p>
            <p><strong>Hair Color:</strong> ${character.hair_color}</p>
            <p><strong>Skin Color:</strong> ${character.skin_color}</p>
            <p><strong>Eye Color:</strong> ${character.eye_color}</p>
            <p><strong>Birth Year:</strong> ${character.birth_year}</p>
            <p><strong>Gender:</strong> ${character.gender}</p>
            <p><strong>Homeworld:</strong> ${homeworld}</p>
        `;

        resultsDiv.appendChild(resultItem);
    } catch (error) {
        console.error('Error fetching random character:', error);
    }
}

// Funktion för att spara cache-data till localStorage.
function saveToLocalStorage() {
    localStorage.setItem('peopleCache', JSON.stringify(Array.from(peopleCache.entries())));
    localStorage.setItem('planetCache', JSON.stringify(Array.from(planetCache.entries())));
}

// Funktion för att ladda cache-data från localStorage.
function loadFromLocalStorage() {
    const savedPeopleCache = localStorage.getItem('peopleCache');
    const savedPlanetCache = localStorage.getItem('planetCache');

    if (savedPeopleCache) {
        const peopleEntries = JSON.parse(savedPeopleCache);
        for (const [key, value] of peopleEntries) {
            peopleCache.set(key, value);
        }
    }

    if (savedPlanetCache) {
        const planetEntries = JSON.parse(savedPlanetCache);
        for (const [key, value] of planetEntries) {
            planetCache.set(key, value);
        }
    }
}

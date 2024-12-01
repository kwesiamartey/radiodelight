// Function to get the station name from the URL or localStorage
function getStationNameFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Check if station name is in localStorage
    if (localStorage.getItem('name')) {
        return localStorage.getItem('name'); // Return the station name from localStorage
    } else {
        const stationName = params.get("name"); // Otherwise, get the name from the URL
        if (stationName) {
            localStorage.setItem('name', stationName); // Save it to localStorage for future use
        }
        return stationName; // Return the station name from URL
    }
}

/**
 * Fetch station details and log them to the console.
 * @param {string} stationName - The name of the radio station.
 */
function fetchStationData(stationName) {
    // Encode station name for the URL
    const sanitizedCountryPath = encodeURIComponent(stationName);
    const apiUrl = `${document.querySelector('meta[name="api-base-url"]').content}/station.php?station=${sanitizedCountryPath}`;

    // Fetch data from the PHP endpoint
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            // Assuming the response is an array with one station object
            const station = data[0];

            // Ensure station data exists before storing in localStorage
            if (station && station.name && station.url && station.location) {
                localStorage.setItem('name', station.name);
                localStorage.setItem('url', station.url);
                localStorage.setItem('bit', station.bit || 'Unknown'); // Fallback if 'bit' is missing
                localStorage.setItem('location', station.location);
                localStorage.setItem('img', station.logo);
                localStorage.setItem('selectedCountryPaths', selectedCountryPath || 'Unknown'); // Ensure selectedCountryPath exists
            } else {
                console.error('Incomplete station data:', station);
                return; // Exit if data is incomplete
            }

            // Create structured data
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "RadioStation",
                "name": station.name,
                "url": `https://radiosdelight.com/play.html?name=${encodeURIComponent(station.name)}`,
                "broadcastFrequency": station.url, // Assuming this is the correct frequency info
                "areaServed": {
                    "@type": "Place",
                    "name": station.location
                },
                "description": `Tune in and listen to ${station.name} Radio live on RadiosDelight.com. Enjoy the best internet radio experience for free.`,
                "logo": station.logo,
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": station.location, // If location is a country name, fine. Otherwise, adjust this.
                    "addressLocality": station.location // If more specific location info is available
                }
            };
          console.log(JSON.stringify(structuredData, null, 2));

            // Dynamically add structured data to the page
            let ldScript = document.getElementById('structured-data');
            if (!ldScript) {
                ldScript = document.createElement('script');
                ldScript.type = 'application/ld+json';
                ldScript.id = 'structured-data';
                document.head.appendChild(ldScript);
            }
            ldScript.textContent = JSON.stringify(structuredData);
        })
        .catch(error => {
            console.error('Error fetching station data:', error);
        });
}


// Get station name from the URL or localStorage and fetch its data
const stationName = getStationNameFromUrl();
if (stationName) {
    fetchStationData(stationName);
} else {
    console.error("No station name found in URL or localStorage.");
}

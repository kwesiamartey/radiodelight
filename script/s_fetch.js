/**
 * Fetch station details and log them to the console.
 * @param {string} stationName - The name of the radio station.
 */
function fetchStationData(stationName) {
    // Encode station name for the URL
    const sanitizedCountryPath = encodeURIComponent(stationName);
    const apiUrl =  `${document.querySelector('meta[name="api-base-url"]').content}/station.php?station=${sanitizedCountryPath}`;

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

            // Log station details to the console
            console.log('Station Name:', station.name);
            console.log('Location:', station.location);
            console.log('Bitrate:', station.url);
            console.log('Logo URL:', station.logo);
            console.log('Stream URL:', station.url);

            // Create structured data
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "RadioStation",
                "name": station.name,
              "url": `https://radiosdelight.com/play.html?name=${encodeURIComponent(station.name)}`,
                "broadcastFrequency": station.url,
                "areaServed": {
                    "@type": "Place",
                    "name": station.location
                },
                "audio": {
                    "@type": "AudioObject",
                    "contentUrl": station.url
                },
                "logo": station.logo
            };

            // Log structured data to the console
                     console.log('Structured Data:', JSON.stringify(structuredData, null, 2));

                     // Dynamically add structured data to the page
                     const ldScript = document.getElementById('structured-data') || document.createElement('script');
                     ldScript.type = 'application/ld+json';
                     ldScript.id = 'structured-data';
                     ldScript.textContent = JSON.stringify(structuredData);
                     document.head.appendChild(ldScript);
                 })
                 .catch(error => {
                     console.error('Error fetching station data:', error);
                 });
}

// Example: Fetch data for the station "1940s Radio Station"
fetchStationData('1940s Radio Station');

 let stationData = []; // Store stations here to avoid multiple fetches
    let selectedCountryPath = localStorage.getItem('selectedCountryPath') || "italyRadioList.json";

    //let selectedCountryPath = '';
   const audio = new Audio();
    let hls;
    let currentPage = 1;
    const itemsPerPage = 48;
    let currentPage1 = 1;
    const itemsPerPage1 = 32; // Number of countries per page
    const progress = document.getElementById('progress');
    let isPlaying = false; // Track the play/pause state
    let stationDetailsGlobal = "";
    const stationListContent = document.getElementById('stationListContent');
    const countryList = document.getElementById('countryList');

    const selectedCountryPathName = localStorage.getItem('selectedCountryPathName') || "Italy";


    async function loadStationPlaceholders() {
        // Generate 48 placeholders dynamically with shimmer effect
        stationListContent.innerHTML = Array.from({ length: 48 })
            .map(() => `
                <div class="station-item shimmer">
                    <div class="shimmer-box">
                        <div class="shimmer-content"></div>
                    </div>
                    <span class="shimmer-text"></span>
                </div>
            `)
            .join('');
    }


    async function loadCountryPlaceholders() {
     // Generate 32 placeholders dynamically with shimmer effect
     countryList.innerHTML = Array.from({ length: 32 })
         .map(() => `
             <div class="countryList shimmer1">
                 <div class="shimmer-box1">
                     <div class="shimmer-content1"></div>
                 </div>
                 <span class="shimmer-text1"></span>
             </div>
         `)
         .join('');
 }

        /**
     * Function to fetch and insert HTML content into a target element
     * @param {string} url - The URL of the HTML file to fetch
     * @param {string} targetId - The ID of the target element to inject content into
     */
   function loadContent(url, targetId) {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(data => {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.innerHTML = data;
          } else {
            console.error(`Element with ID "${targetId}" not found.`);
          }
        })
        .catch(error => console.error('Error loading content:', error));
    }


   function loadFooter(url, targetId) {
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
              }
              return response.text();
            })
            .then(data => {
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                targetElement.innerHTML = data;
              } else {
                console.error(`Element with ID "${targetId}" not found.`);
              }
            })
            .catch(error => console.error('Error loading content:', error));
        }


// Update the .countryTitle element if it exists
    const countryTitleElement = document.querySelector('.countryTitle');
    if (countryTitleElement) {
        countryTitleElement.textContent = `Live ${selectedCountryPathName} Radio Station Online`;
    }
    else {
        console.warn('.countryTitle element not found in the DOM.');
    }


 // Function to show tooltip
  function showTooltip(event, text) {
    let tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    // Position the tooltip near the mouse cursor
    const tooltipOffset = 10;
    tooltip.style.left = `${event.pageX + tooltipOffset}px`;
    tooltip.style.top = `${event.pageY + tooltipOffset}px`;

    // Make the tooltip visible
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });

    // Store the tooltip element for removal later
    event.target._tooltip = tooltip;
  }

  // Function to hide tooltip
  function hideTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip) {
      tooltip.remove();
      event.target._tooltip = null;
    }
  }


function loadCountries() {
const sanitizedCountryPath = encodeURIComponent('query_countries.php');
const baseUrl = `${document.querySelector('meta[name="api-base-url"]').content}/${sanitizedCountryPath}`;

    fetch(baseUrl)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
            const totalPages = Math.ceil(data.length / itemsPerPage1);
            renderCountryList(data, currentPage1, totalPages);
            setupPaginationButtons(data, totalPages);
        })
        .catch(error => console.error('Error fetching country data:', error));
}

function renderCountryList(data, page, totalPages) {
    const countryList = document.getElementById('countryList');
    countryList.innerHTML = ''; // Clear the current list

    // Determine the start and end indices for the current page
    const startIndex = (page - 1) * itemsPerPage1;
    const endIndex = Math.min(startIndex + itemsPerPage1, data.length);

    // Display countries for the current page
    for (let i = startIndex; i < endIndex; i++) {
        const country = data[i];
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img class="img" src="${country.flag}" alt="${country.name} Flag" style="width:100%;height:40px;">`;
        listItem.addEventListener('mouseenter', (event) => showTooltip(event, country.name));
        listItem.addEventListener('mouseleave', hideTooltip);
        listItem.addEventListener('click', () => {
            loadStationPlaceholders()
            selectedCountryPath = country.url;
            fetchStations(selectedCountryPath);
           // Retrieve the selected country name from localStorage or use a fallback
            // Update the .countryTitle element if it exists
            const countryTitleElement = document.querySelector('.countryTitle');
            localStorage.setItem('selectedCountryPathName', country.name)
            localStorage.setItem('selectedCountryPath', country.url)
            countryTitleElement.textContent = `Live ${country.name} Radio Station Online`;
        });
        countryList.appendChild(listItem);
    }
}

function setupPaginationButtons(data, totalPages) {
    const paginationControls = document.getElementById('paginationControls1');
    paginationControls.innerHTML = ''; // Clear any existing controls

    const maxVisibleButtons = 3; // Number of visible buttons around the current page
    const ellipsis = '...';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '<<';
    prevButton.disabled = currentPage1 === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage1 > 1) {
            currentPage1--;
            renderCountryList(data, currentPage1, totalPages);
            setupPaginationButtons(data, totalPages); // Refresh pagination buttons
        }
    });
    paginationControls.appendChild(prevButton);

    // Page number buttons
    if (totalPages <= maxVisibleButtons + 2) {
        // If total pages are few, display all
        for (let i = 1; i <= totalPages; i++) {
            addPageButton(i);
        }
    } else {
        // Handle case when total pages are more than the visible buttons
        let startPage, endPage;

        if (currentPage1 <= maxVisibleButtons) {
            // Near the beginning
            startPage = 1;
            endPage = maxVisibleButtons;
        } else if (currentPage1 + maxVisibleButtons - 1 >= totalPages) {
            // Near the end
            startPage = totalPages - maxVisibleButtons + 1;
            endPage = totalPages;
        } else {
            // Somewhere in the middle
            startPage = currentPage1 - Math.floor(maxVisibleButtons / 2);
            endPage = currentPage1 + Math.floor(maxVisibleButtons / 2);
        }

        // Show the first page and ellipsis if needed
        if (startPage > 1) {
            addPageButton(1);
            if (startPage > 2) {
                addEllipsis();
            }
        }

        // Display range of page numbers
        for (let i = startPage; i <= endPage; i++) {
            addPageButton(i);
        }

        // Show the last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                addEllipsis();
            }
            addPageButton(totalPages);
        }
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = '>>';
    nextButton.disabled = currentPage1 === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage1 < totalPages) {
            currentPage1++;
            renderCountryList(data, currentPage1, totalPages);
            setupPaginationButtons(data, totalPages); // Refresh pagination buttons
        }
    });
    paginationControls.appendChild(nextButton);

    function addPageButton(page) {
        const pageButton = document.createElement('button');
        pageButton.textContent = page;
        pageButton.disabled = page === currentPage1;
        pageButton.addEventListener('click', () => {
            currentPage1 = page;
            renderCountryList(data, currentPage1, totalPages);
            setupPaginationButtons(data, totalPages); // Refresh pagination buttons
        });
        paginationControls.appendChild(pageButton);
    }

    function addEllipsis() {
        const ellipsisSpan = document.createElement('span');
        ellipsisSpan.textContent = ellipsis;
        paginationControls.appendChild(ellipsisSpan);
    }
}

async function fetchStations(countryPath = selectedCountryPath, retries = 3, delay = 5000, chunkSize = 1000) {
    const sanitizedCountryPath = encodeURIComponent(countryPath);
    const baseUrl2 =  `${document.querySelector('meta[name="api-base-url"]').content}/query_stations.php?path=${sanitizedCountryPath}`;

    try {
        // Attempt to fetch the entire dataset at once
        stationData = await fetchWithRetry(baseUrl2, retries, delay);

        // If data is successfully fetched, display it
        displayStations(stationData);
    } catch (error) {
        console.warn('Failed to fetch entire dataset, switching to chunked loading...');

        // If fetching the entire dataset fails, use chunked loading
        stationData = await fetchStationsInChunks(baseUrl2, chunkSize);
        displayStations(stationData);
    }
}

async function fetchStationsInChunks(baseUrl, chunkSize) {
    let allStations = [];
    let offset = 0;

    while (true) {
        const url = `${baseUrl}&offset=${offset}&limit=${chunkSize}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const chunk = await response.json();


            if (chunk.length === 0) break;

            allStations = allStations.concat(chunk);
            offset += chunkSize;
        } catch (error) {
            console.error(`Error fetching chunk at offset ${offset}:`, error);
            break;
        }
    }

    const filteredStations = allStations.filter(station => station.name !== 'Local Fm');
    return filteredStations;
}

// Function to fetch data with retries
async function fetchWithRetry(url, retries = 3, delay = 3000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            console.log(`Fetching attempt ${attempt + 1} for URL: ${url}`);
            const response = await fetch(url);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Fetch failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            return data.filter(station => station.name !== 'Local Fm');
        } catch (error) {
            console.warn(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt < retries - 1) await new Promise(res => setTimeout(res, delay));
            else throw error; // Rethrow after last attempt
        }
    }
}

// Function for chunk loading
function filterStations() {
    const query = document.getElementById('searchInput').value.toLowerCase();



    const filteredStations = stationData.filter(station =>
        station.name.toLowerCase().includes(query)

    );
    currentPage = 1; // Reset to first page on filter


     displayStations(filteredStations);

    if (filteredStations.length > 0) {
        updateSearchActionSchema(filteredStations[0].name, filteredStations[0].location);
    } else {
        updateSearchActionSchema(filteredStations.name, filteredStations.location);
    }


}



function updateSearchActionSchema(query, filteredStationsLoaction) {
    const searchActionScript = document.getElementById('search-action');

    if (searchActionScript) {
        // Update the target URL in the structured data

        const updatedSearchAction = {
            "@context": "https://schema.org",
            "@type": "SearchAction",
"target": `https://radiosdelight.com/play.html?name=${encodeURIComponent(query)}&search=${encodeURIComponent(query)}&location=${encodeURIComponent(filteredStationsLoaction)}`,
            "query-input": "required name=search_term_string"
        };
 console.log(JSON.stringify(updatedSearchAction, null, 2));
        // Update the script tag content with the new search query
        searchActionScript.textContent = JSON.stringify(updatedSearchAction);
    }
}


function displayStations(stations) {
    const stationList = document.getElementById('stationListContent');
    const paginationControls = document.getElementById('paginationControls');
    stationList.innerHTML = ''; // Clear current list
    paginationControls.innerHTML = ''; // Clear pagination

    if (stations.length === 0) {
        stationList.innerHTML = `<p>No results found.</p>`;
        return;
    }

    // No sorting, stations remain in the order received from the server

    // Calculate pagination details
    const totalPages = Math.ceil(stations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const stationsToDisplay = stations.slice(startIndex, startIndex + itemsPerPage);

    // Render stations
    stationsToDisplay.forEach(station => {
        const stationItem = document.createElement('div');
        stationItem.className = 'station-item';

        const truncatedName = station.name.length > 13 ? station.name.slice(0, 13) + '...' : station.name;
        const logoUrl = station.logo && station.logo.trim() !== '' ? station.logo : createStationLogoCanvas(station.name);


               stationItem.innerHTML = `
                        <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 text-center d-flex flex-column align-items-center" style="width: 100%; height: 140px; border-radius: 5px 5px 0px 0px; position: relative; overflow: hidden; background-color: white;">
                            <img style="width: 100%; height: 142px; object-fit: fill;"
                                 src="${logoUrl}"
                                 loading="lazy"
                                 alt="${truncatedName}">
                        </div>
                        <div class="mt-1 mb-2 d-flex align-items-center justify-content-center" style="width:100%;height37px;color:#eee;" >${truncatedName}</div>`;


        const imgElement = stationItem.querySelector('img');

        const loadTimeout = setTimeout(() => {
            imgElement.src = '/img/mast.jpg'; // Fallback image after 5 seconds
        }, 9000);

        imgElement.onload = () => {
            clearTimeout(loadTimeout);
            stationItem.addEventListener('click', () => {
                localStorage.setItem('name', station.name);
                localStorage.setItem('url', station.url);
                localStorage.setItem('bit', station.bit);
                localStorage.setItem('location', station.location);
                localStorage.setItem('img', imgElement.src);
                localStorage.setItem('selectedCountryPaths', selectedCountryPath);

                window.location.href = `play.html?name=${station.name}`;
            });
        };

        imgElement.onerror = () => {
            clearTimeout(loadTimeout);
            imgElement.src = '/img/mast.jpg';
            stationItem.addEventListener('click', () => {
                localStorage.setItem('name', station.name);
                localStorage.setItem('url', station.url);
                localStorage.setItem('bit', station.bit);
                localStorage.setItem('location', station.location);
                localStorage.setItem('img', imgElement.src);
                localStorage.setItem('selectedCountryPaths', selectedCountryPath);

                window.location.href = `play.html?name=${station.name}`;
            });
        };

        stationList.appendChild(stationItem);
    });

    createPaginationControls(stations.length, totalPages);
}


function createPaginationControls(totalStations, totalPages) {
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = ''; // Clear previous controls

    // Display page info (e.g., "Page 1 of 27")
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationControls.appendChild(pageInfo);

    // Helper function to create clickable buttons
    const createButton = (text, onClick) => {
        const button = document.createElement('span');
        button.textContent = text;
        button.style.cursor = 'pointer';
        button.style.margin = '0 5px';
        button.onclick = onClick;
        paginationControls.appendChild(button);
    };

    // Previous button
    if (currentPage > 1) {
        createButton('<<', () => {
            currentPage--;
            displayStations(stationData);
        });
    }

    // Show the first 3 pages, then ellipsis, and last page
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            const currentPageButton = document.createElement('span');
            currentPageButton.textContent = i;
            currentPageButton.style.fontWeight = 'bold';
            currentPageButton.style.margin = '0 5px';
            paginationControls.appendChild(currentPageButton);
        } else if (i <= 3 || i === totalPages) {
            // Display first 3 pages or the last page
            createButton(i, () => {
                currentPage = i;
                displayStations(stationData);
            });
        } else if (i === 4) {
            // Add ellipsis after the first 3 pages
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.margin = '0 5px';
            paginationControls.appendChild(ellipsis);
        }
    }

    // Next button
    if (currentPage < totalPages) {
        createButton('>>', () => {
            currentPage++;
            displayStations(stationData);
        });
    }
}


function createStationLogoCanvas(stationName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = 140;
    canvas.width = 140;

    // Generate a random background color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    context.fillStyle = randomColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Get initials and limit them to a maximum of 3 characters
    const initials = stationName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 3); // Limit initials to 3 characters

    // Set text properties
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.fontWeight=600;
    context.font = "60px 'Montserrat', sans-serif";
    context.textBaseline = 'middle';

    // Add shadow to the text
    context.shadowColor = '#333';
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowBlur = 5;

    // Draw the initials in the center of the canvas
    context.fillText(initials, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL();
}


function openPeacefmPopupWithData(stationName, logoUrl, audioUrl) {
    // Validate the audio URL
    if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) {
        alert("Invalid audio URL.");
        return;
    }

    // Open the URL directly in a new popup window
    const popupWindow = window.open(audioUrl, "_blank", "width=300,height=500");

    // Check if the popup was blocked
    if (!popupWindow) {
        alert("Popup blocked! Please allow popups for this site.");
    } else {
        popupWindow.focus();
    }
}










// Main function with async/await
window.onload = async () => {
    try {
        // Load header and footer first
        await loadContent('header.html', 'head-top');
        await loadFooter('footer.html', 'page-footer');

        console.log("Header and Footer loaded");

        // Load other content after header and footer are ready
        loadStationPlaceholders();
        loadCountryPlaceholders();
        loadCountries();
        fetchStations();
    } catch (error) {
        console.error(error);
    }
};
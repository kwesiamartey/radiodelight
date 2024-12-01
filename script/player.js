 // Retrieve data from localStorage
    const name = localStorage.getItem('name');
    const url = localStorage.getItem('url');
    const bit = localStorage.getItem('bit');
    const location1 = localStorage.getItem('location');
    const img = localStorage.getItem('img');
    const selectedCountryPath1 = localStorage.getItem('selectedCountryPaths');
    let stationData = []; // Store stations here to avoid multiple fetches
    const selectedCountryPath = selectedCountryPath1 || "germanyRadioList.json";
    //let selectedCountryPath = '';
    const audio = new Audio();
    let hls;
    let currentPage = 1;
    const itemsPerPage = 18;
    let currentPage1 = 1;
    const itemsPerPage1 = 32; // Number of countries per page
    const progress = document.getElementById('progress');
    const playButton = document.querySelector('.play-button');
    const volumeControl = document.getElementById('volumeControl');
    let isPlaying = false; // Track the play/pause state
    let stationDetailsGlobal = "";
    document.getElementById('countryTitle').style.display = 'block';
    document.querySelector('.countryTitle').style.display = 'block';
    document.getElementById('downloadTitle').style.display = 'block';
    document.getElementById('country_list_wrapper').style.display = 'block';
         // Update UI with station information playing
    const stationLogo = document.getElementById('stationLogo');
    const breadcrumbs = document.getElementById('breadcrumbs');
    document.getElementById('breadcrumbs').style.display = 'block';
    document.querySelector('.countryTitle').style.display = 'none';
    const stationListContent = document.getElementById('stationListContent');
    const countryList = document.getElementById('countryList');
    // Set initial volume (based on the slider's default value)
    audio.volume = volumeControl.value;



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
                <div class="countryList shimmer">
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


    /**
 * Function to fetch and insert HTML content into a target element
 * @param {string} url - The URL of the HTML file to fetch
 * @param {string} targetId - The ID of the target element to inject content into
 */
 async function loadContent(url, targetId) {
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


 async function loadFooter(url, targetId) {
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


    // Update audio volume when the slider is adjusted
    volumeControl.addEventListener('input', function () {
        audio.volume = this.value;
        console.log(`Volume set to: ${Math.round(this.value * 100)}%`);
    });

    // Optional: Display the volume level as a percentage
    volumeControl.addEventListener('input', function () {
        this.title = `Volume: ${Math.round(this.value * 100)}%`;
    });


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
        listItem.innerHTML = `<img class="img" src="${country.flag}" alt="${country.name} Flag" style="width:50px;height:45px;">`;
        listItem.addEventListener('mouseenter', (event) => showTooltip(event, country.name));
        listItem.addEventListener('mouseleave', hideTooltip);
        listItem.addEventListener('click', () => {
             audio.pause();
             playButton.innerHTML = '▶';  // Play icon
             isPlaying = false; // Play icon
            //document.getElementById('breadcrumbs').style.display = 'none';
            //document.querySelector('.playing-station-wrap').style.display = 'none';
            //document.querySelector('.footer-div-wraaper').style.display = 'none';
            //selectedCountryPath = country.url;
            //fetchStations(selectedCountryPath);
            localStorage.setItem('selectedCountryPathName', country.name)
            localStorage.setItem('selectedCountryPath', country.url)

            // Correct usage of string interpolation with backticks
             window.location.href = `index.html?name=${country.name}`;
            document.querySelector('.countryTitle').textContent = `Live ${country.name} Radio Station Online`;
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
    if (totalPages <= maxVisibleButtons + 2)
     {
        // If total pages are few, display all
        for (let i = 1; i <= totalPages; i++) {
            addPageButton(i);
        }
    }
    else {
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

async function fetchStations(countryPath = selectedCountryPath, retries = 3, delay = 3000, chunkSize = 1000) {
    const sanitizedCountryPath = encodeURIComponent(countryPath);
    const baseUrl2 = `${document.querySelector('meta[name="api-base-url"]').content}/query_stations.php?path=${sanitizedCountryPath}`;

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
            console.log('Fetched chunk:', chunk);  // Log the fetched chunk

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
async function fetchWithRetry(url, retries, delay) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Filter out stations with the name "Local Fm"
            return data.filter(station => station.name !== 'Local Fm');
        } catch (error) {
            console.warn(`Attempt ${attempt + 1} failed. Retrying...`);
            if (attempt < retries - 1) await new Promise(res => setTimeout(res, delay));
            else throw error; // Throw error if all retries fail
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

    // Sort stations in descending order by name
    stations.sort((a, b) => b.name.localeCompare(a.name)); // Reverse alphabetical order

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
            imgElement.src = '/img/mast2.jpg'; // Fallback image after 3 seconds
        }, 9000);

        imgElement.onload = () => {
            clearTimeout(loadTimeout);
            stationItem.addEventListener('click', () => {
                   localStorage.setItem('name', station.name);
                                    localStorage.setItem('url', station.url);
                                    localStorage.setItem('bit', station.bit);
                                    localStorage.setItem('location', station.location);
                                    localStorage.setItem('img', imgElement.src);
                                    localStorage.setItem('selectedCountryPaths', selectedCountryPath)
                playButton.innerHTML = '▶';  // Play icon
                initAudioPlayer(station.url, imgElement.src, station.name, station.bit, station.location);
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
                                localStorage.setItem('selectedCountryPaths', selectedCountryPath)
                playButton.innerHTML = '▶';  // Play icon
                initAudioPlayer(station.url, imgElement.src, station.name, station.bit, station.location);
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

//initAudioPlayer(url, img, name, bit, location1)
function initAudioPlayer(url, image, stationName, bit, country) {
    stationLogo.src = image;
    stationLogo.style.display = 'block';
    breadcrumbs.textContent = `Radio station | ${country} | ${stationName}`;
    stationDetailsGlobal = `${stationName} (${country}) (Web)`;

    // Handle image load errors
    stationLogo.onerror = () => handleImageError(stationLogo, stationName);
    // Handle specific bit conditions for popups
    if (bit === '00') {
        audio.pause();
        playButton.innerHTML = '▶';  // Play icon
        openPopupWithData(stationName, image, url);
        return;
    } else if (bit === '001') {
        audio.pause();
        playButton.innerHTML = '▶';  // Play icon
        openPeacefmPopupWithData(stationName, image, url);
        return;
    }

    // Reset HLS and audio element for fresh playback
    if (typeof hls !== 'undefined' && hls !== null) {
        hls.destroy();
        hls = null;
    }

            audio.src = url;
            const audioExtension = url.split('.').pop().toLowerCase();

            // Show the spinner when loading starts
            showSpinner(true);

            // If it's an HLS (m3u8) stream, use HLS.js
            if (audioExtension === 'm3u8') {
                if (Hls.isSupported()) {
                    if (hls) {
                        hls.destroy(); // Destroy the previous instance if any
                    }
                    hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(audio);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        showSpinner(false); // Hide the spinner once the audio is ready
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        showSpinner(false); // Hide the spinner on error
                        //showCustomError('Error, Try again later.');
                        const stationDetails = `${stationName} (${country}) (Web)`;
                        handlePlaybackError(stationDetails, url, 'error')
                    });
                } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                    // For Safari or native HLS support
                    audio.src = audioUrl;
                    audio.addEventListener('canplay', () => {
                        showSpinner(false); // Hide the spinner when audio is ready
                    });
                     const stationDetails = `${stationName} (${country}) (Web)`;
                     sendEmailNotification(stationDetails, url, 'success')
                } else {
                    showSpinner(false); // Hide the spinner on error
                    //showCustomError('Error, Try again later.');
                    const stationDetails = `${stationName} (${country}) (Web)`;
                    handlePlaybackError(stationDetails, url, 'error')
                    return;
                }
            } else {
                // Use native HTML5 audio for other formats
                audio.addEventListener('canplay', () => {
                    showSpinner(false); // Hide the spinner when audio is ready
                });
                const stationDetails = `${stationName} (${country}) (Web)`;
                     sendEmailNotification(stationDetails, url, 'success')
            }

            // Handle error events for unsupported formats
            audio.addEventListener('error', function() {
                showSpinner(false); // Hide the spinner on error
                //showCustomError('Error, Try again later.');
                const stationDetails = `${stationName} (${country}) (Web)`;
                handlePlaybackError(stationDetails, url, 'error')
            });

}

   // Show or hide the spinner
function showSpinner(show) {
            progress.style.display = show ? 'block' : 'none';
}

// Play/pause functionality with icons
playButton.addEventListener('click', () => {

             /* if (bit === '00') {
                    audio.pause();
                    playButton.innerHTML = '▶';  // Play icon
                    openPopupWithData(name, img, url);
                    return;
              }
              else if (bit === '001') {
                    audio.pause();
                    playButton.innerHTML = '▶';  // Play icon
                    openPeacefmPopupWithData(name, img, url);
                    return;
              }*/



              if (!isPlaying) {
                    audio.play();
                    playButton.innerHTML = '||';  // Pause icon
                    showSpinner(false); // Hide the spinner when playing starts
                    isPlaying = true;
                    sendEmailNotification(stationDetailsGlobal, audio.src, 'success')
                    //initAudioPlayer(url, img, name, bit, location1)

              } else {
                    audio.pause();
                    playButton.innerHTML = '▶';  // Play icon
                    isPlaying = false;
              }
});

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

function handlePlaybackError(url, stationName) {
                progress.style.display = 'none';

                alert("We couldnt play this station, please check back later");
            
                sendEmailNotification(stationName, url, 'error');
}

function sendEmailNotification(stationName, stationUrl, status) {
        const formData = new FormData();
        formData.append('stationName', stationName);
        formData.append('stationUrl', stationUrl);
        formData.append('status', status);

        fetch('https://lornamobileappsdev.uk/mobileAppsWebsite/sendEmail.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                console.log('Email sent successfully:', result.message);
            } else {
                console.error('Failed to send email:', result.message);
            }
        })
        .catch(error => console.error('Error sending email:', error));
}

function sendEmailComment(stationName, stationUrl, status) {
            const formData = new FormData();
            formData.append('stationName', stationName);
            formData.append('stationUrl', stationUrl);
            formData.append('status', status);

            fetch('https://lornamobileappsdev.uk/mobileAppsWebsite/commentEmail.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    console.log('Email sent successfully:', result.message);
                } else {
                    console.error('Failed to send email:', result.message);
                }
            })
            .catch(error => console.error('Error sending email:', error));
 }

/**
         * Sanitize user input by escaping special characters.
*/
function sanitizeInput(input) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                "/": '&#x2F;',
            };
            return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
     * Show toast notification.
*/
function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');

            // Hide the toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
}

function submitForm() {


    const stationName = sanitizeInput(document.getElementById('stationName').value.trim());
    const title = sanitizeInput(document.getElementById('title').value.trim());
    const message = sanitizeInput(document.getElementById('message').value.trim());

    if (!stationName || !title || !message) {
        alert("All fields are required!");
        return false;
    }

     const msgDetails = `${title}<br>${message}<br>${url}`;


    // Call email notification function with sanitized inputs
    sendEmailComment(name, msgDetails, "success");

    // Show toast notification
    showToast("Message sent successfully!");

    // Clear the form after submission
    document.getElementById('emailForm').reset();
    return true;
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


function openPopupWithData(stationName, logoUrl, audioUrl) {
    // Open a new window for the popup
    const popupWindow = window.open("", "_blank", "width=300,height=700");
    // Check if the popup was blocked by the browser
    if (!popupWindow) {
        alert("Popup blocked! Please allow popups for this site.");
        return;
    }

    // Define the HTML structure and styling for the popup content
    const popupContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${stationName} - Radio Station</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f9f9f9; }
                    h1 { color: #333; font-size: 1.2em; margin-top: 10px; }
                    img { width: 100px; height: 100px; border-radius: 50%; margin-bottom: 15px; }
                    audio { width: 100%; margin-top: 20px; }
                    .container { display: flex; flex-direction: column; align-items: center; }
                    .close-button { margin-top: 20px; padding: 8px 16px; font-size: 1em; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${logoUrl}" alt="${stationName} Logo">
                    <h1>${stationName}</h1>
                    
                    <!-- Audio player for station -->
                    <video controls autoplay>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </video>
                    
                    <!-- Close button -->
                    <button class="close-button" onclick="window.close()">Close</button>
                    
                    <!-- Ad container -->
                    <ins class="adsbygoogle"
                         style="display:block; text-align:center;"
                         data-ad-layout="in-article"
                         data-ad-format="fluid"
                         data-ad-client="ca-pub-3366131354604966"
                         data-ad-slot="3488022788"></ins>
                </div>
            </body>
        </html>`;

    // Write the initial HTML content to the popup
    popupWindow.document.write(popupContent);

    // Add the Google Ads script asynchronously after the HTML content is loaded
    const adScript = popupWindow.document.createElement("script");
    adScript.async = true;
    adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3366131354604966";
    adScript.crossOrigin = "anonymous";
    popupWindow.document.body.appendChild(adScript);

    // Initialize the Google ad once the script loads
    adScript.onload = () => {
        const inlineScript = popupWindow.document.createElement("script");
        inlineScript.textContent = "(adsbygoogle = window.adsbygoogle || []).push({});";
        popupWindow.document.body.appendChild(inlineScript);
    };

    // Optional: Focus on the popup window
    popupWindow.focus();

   }

    // Main function with async/await
    window.onload = async () => {
        try {
            // Load header and footer first
            await loadContent('header.html', 'head-top');
            await loadFooter('footer.html', 'page-footer');
            await loadContent('comment.html', 'commenting');
            await initAudioPlayer(url, img, name, bit, location1)
            console.log("Header and Footer loaded");

            // Load other content after header and footer are ready

             loadStationPlaceholders()
              loadCountryPlaceholders()
              loadCountries();
              fetchStations();
        } catch (error) {
            console.error(error);
        }
    };
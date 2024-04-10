var map = L.map('map').setView([51.505, -0.09], 13); // Set initial coordinates and zoom level
var markers = L.featureGroup(); // Create a feature group for markers

// Add OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function showLoading() {
    var overlay = document.querySelector('.overlay');
    var spinner = document.querySelector('.loading-spinner');
    overlay.style.display = 'block';
    spinner.style.display = 'block';
}

// Function to hide loading spinner and fade effect
function hideLoading() {
    var overlay = document.querySelector('.overlay');
    var spinner = document.querySelector('.loading-spinner');
    overlay.style.display = 'none';
    spinner.style.display = 'none';
}

// Function to handle search bar input and make request to server
function handleSearch() {
    showLoading()
    var searchBar = document.querySelector('.search-bar');
    var userInput = searchBar.value.trim(); // Get the user input from the search bar

    // Send the user input to the server
    fetch('http://127.0.0.1:5000/suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // Clear previous markers
        markers.clearLayers();
        document.querySelector('.suggestions-container').innerHTML = '';
        var i = 1

        // Add received GeoJSON data to the map
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng){
                options = {
                    text: i,
                    isAlphaNumericIcon: true,
                    backgroundColor: '#292929',
                    textColor:'white',
                    iconShape:'marker',
                    borderColor:'transparent'
                }
                i ++
                return L.marker(latlng, {icon: L.BeautifyIcon.icon(options)});
            },
            onEachFeature: function(feature, layer) {
                // Create a popup with place name
                var popupContent = feature.properties.name;
                layer.bindPopup(popupContent);

                // Fit map bounds to the markers
                markers.addLayer(layer);
                map.fitBounds(markers.getBounds());

                var suggestionContainer = document.querySelector('.suggestions-container');
                var card = document.createElement('div');
                card.classList.add('suggestion-card');

                // Set styles based on property values
                if (feature.properties.day >= 1 && feature.properties.day <= 3) {
                    card.classList.add(`day${feature.properties.day}`);
                }

                var nameHeader = document.createElement('h2');
                nameHeader.textContent = feature.properties.name;
                card.appendChild(nameHeader);

                var descriptionPara = document.createElement('p');
                descriptionPara.textContent = feature.properties.description;
                card.appendChild(descriptionPara);

                var highlightsPara = document.createElement('p');
                highlightsPara.textContent = `Highlights: ${feature.properties.highlights}`;
                card.appendChild(highlightsPara);

                var highlightsPara = document.createElement('p');
                highlightsPara.textContent = `Days: ${feature.properties.day}`;
                card.appendChild(highlightsPara);

                var image = document.createElement('img');
                image.src = feature.properties.image
                card.appendChild(image);

                suggestionContainer.appendChild(card);
            }
        }).addTo(map);
        hideLoading()

        var suggestionCards = document.querySelectorAll('.suggestion-card');
        suggestionCards.forEach(function(card) {
            card.addEventListener('mouseenter', handleCardHover);
            card.addEventListener('mouseleave', handleCardHoverExit);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function handleCardHover(event) {
    var index = Array.from(event.target.parentNode.children).indexOf(event.target);
    
    var layers = markers.getLayers();

    layers.forEach(function(layer, i) {
        
        optionsHovered = {
            text: i+1,
            isAlphaNumericIcon: true,
            backgroundColor: '#ffc425',
            textColor:'#2f241d',
            iconShape:'marker',
            borderColor:'transparent'
        }
        if (i === index) {
            layer.setIcon(L.BeautifyIcon.icon(optionsHovered))
        }
    });
}

function handleCardHoverExit(event) {

    var layers = markers.getLayers();

    layers.forEach(function(layer, i) {
        optionsDefault = {
            text: i+1,
            isAlphaNumericIcon: true,
            backgroundColor: '#292929',
            textColor:'white',
            iconShape:'marker',
            borderColor:'transparent'
        }
        layer.setIcon(L.BeautifyIcon.icon(optionsDefault))
    });
    console.log('Exited')
}

hideLoading()
// Event listener for when the user presses enter in the search bar
document.querySelector('.search-bar').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});
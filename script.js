// Map Initialization
const map = L.map('map').setView([52.0, -72.0], 5); // Centered roughly on Quebec

// Base Layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

const baseMaps = {
    "Carte Routière": osm,
    "Satellite": satellite
};

// Layer Control handled later with overlays


// Features & Logic
let isAddPinMode = false;
let markers = JSON.parse(localStorage.getItem('hunting_markers')) || [];
let tempMarker = null;

// Icons setup
const createIcon = (color) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const icons = {
    animal: createIcon('green'),
    cache: createIcon('orange'),
    piste: createIcon('yellow'),
    camp: createIcon('blue'),
    danger: createIcon('red'),
    default: createIcon('blue')
};

// Crown Lands Overlay (Simulation)
// In a real scenario, this would load a massive KML/GeoJSON
const crownLandsGroup = L.layerGroup().addTo(map);

const loadCrownLands = () => {
    fetch('crown-lands-sample.json')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    switch (feature.properties.type) {
                        case 'ZEC': return { color: "#e67e22", weight: 2, fillOpacity: 0.3 };
                        case 'Reserve': return { color: "#3498db", weight: 2, fillOpacity: 0.3 };
                        default: return { color: "#4a6741", weight: 1, fillOpacity: 0.4 }; // Crown Land
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`<b>${feature.properties.name}</b><br>Type: ${feature.properties.type}`);
                }
            }).addTo(crownLandsGroup);
            layerControl.addOverlay(crownLandsGroup, "Terres de la Couronne (Simulé)");

            // Initialize Search Control
            const searchControl = new L.Control.Search({
                layer: crownLandsGroup,
                propertyName: 'name',
                marker: false,
                moveToLocation: function (latlng, title, map) {
                    map.flyTo(latlng, 10);
                }
            });
            map.addControl(searchControl);
        })
        .catch(err => console.error("Error loading GeoJSON:", err));
};

// Call loader
loadCrownLands();

// --- Functions ---

// 1. Load Saved Markers
const loadSavedMarkers = () => {
    markers.forEach(m => {
        addMarkerToMap(m);
    });
    updateMarkersList();
};

const addMarkerToMap = (data) => {
    const icon = icons[data.type] || icons.default;
    const marker = L.marker([data.lat, data.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`<b>${data.type.toUpperCase()}</b><br>${data.desc}`);
    return marker;
};

// 2. Add Pin Mode
const btnAddPin = document.getElementById('btn-add-pin');
btnAddPin.addEventListener('click', () => {
    isAddPinMode = !isAddPinMode;
    btnAddPin.classList.toggle('active', isAddPinMode);
    document.getElementById('map').style.cursor = isAddPinMode ? 'crosshair' : '';
});

// Map Click Event
map.on('click', (e) => {
    if (!isAddPinMode) return;

    const { lat, lng } = e.latlng;

    // Open Modal
    document.getElementById('modal-add-pin').classList.remove('hidden');

    // Store temp location
    tempMarker = { lat, lng };
});

// Modal Logic
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('modal-add-pin').classList.add('hidden');
});

document.getElementById('form-add-pin').addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('pin-type').value;
    const desc = document.getElementById('pin-desc').value;

    if (tempMarker) {
        const markerData = {
            id: Date.now(),
            lat: tempMarker.lat,
            lng: tempMarker.lng,
            type,
            desc
        };

        markers.push(markerData);
        localStorage.setItem('hunting_markers', JSON.stringify(markers));

        addMarkerToMap(markerData);
        updateMarkersList();

        // Reset
        document.getElementById('modal-add-pin').classList.add('hidden');
        document.getElementById('form-add-pin').reset();

        // Disable mode after adding (optional UX choice, keeps it clean)
        isAddPinMode = false;
        btnAddPin.classList.remove('active');
        document.getElementById('map').style.cursor = '';
    }
});

// 3. Update Sidebar List
function updateMarkersList() {
    const list = document.getElementById('markers-list');
    list.innerHTML = '';

    if (markers.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucun repère ajouté.</p>';
        return;
    }

    markers.forEach(m => {
        const item = document.createElement('div');
        item.className = 'marker-item';
        item.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${m.type.toUpperCase()} <br> <span style="font-size:0.8em; color:#888;">${m.desc.substring(0, 20)}...</span>`;
        item.onclick = () => {
            map.flyTo([m.lat, m.lng], 15);
        };
        list.appendChild(item);
    });
}

// 4. File Import Logic (Basic)
document.getElementById('file-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const geojson = JSON.parse(e.target.result);
            const layer = L.geoJSON(geojson, {
                style: { color: 'purple', weight: 2 } // Custom import style
            }).addTo(map);
            map.fitBounds(layer.getBounds());
            layerControl.addOverlay(layer, file.name);
            alert("Fichier importé avec succès !");
        } catch (err) {
            alert("Erreur lors de la lecture du fichier. Assurez-vous que c'est un GeoJSON valide.");
            console.error(err);
        }
    };
    reader.readAsText(file);
});

// 5. Geolocation
document.getElementById('btn-locate').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
});

map.on('locationfound', (e) => {
    L.circle(e.latlng, e.accuracy).addTo(map);
    L.marker(e.latlng).addTo(map).bindPopup("Vous êtes ici").openPopup();
});

// Init
loadSavedMarkers();

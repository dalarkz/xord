// Map Initialization
const map = L.map('map').setView([47.5, -71.0], 7); // Centered on Quebec City area

// Base Layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

const baseMaps = {
    "Carte Routière": osm,
    "Vue Satellite": satellite
};

// Features & Logic
let isAddPinMode = false;
let isMeasureMode = false;
let measurePoints = [];
let measureLine = null;
let measureMarkers = [];
let markers = JSON.parse(localStorage.getItem('hunting_markers')) || [];
let tempMarker = null;
let userLocationMarker = null;

// Icons setup - Custom images for animals
const createCustomIcon = (imagePath, size = [40, 40]) => {
    return L.icon({
        iconUrl: imagePath,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]],
        popupAnchor: [0, -size[1]]
    });
};

const createColorIcon = (color) => {
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
    // Custom animal icons
    orignal: createCustomIcon('ping_orignal-removebg-preview.png', [45, 45]),
    ours: createCustomIcon('ping_ours-removebg-preview.png', [45, 45]),
    dindon: createCustomIcon('ping_dindon-removebg-preview.png', [45, 45]),
    canard: createCustomIcon('ping_canard-removebg-preview.png', [45, 45]),

    // Generic colored markers for other types
    cerf: createColorIcon('green'),
    autre_gibier: createColorIcon('green'),
    cache: createColorIcon('orange'),
    piste: createColorIcon('yellow'),
    camp: createColorIcon('blue'),
    danger: createColorIcon('red'),
    default: createColorIcon('blue')
};

// --- Real Government WMS Layers ---

// 1. Zones de Chasse (MERN) - Hunting Zone Boundaries
const huntingZonesLayer = L.tileLayer.wms('https://servicesvecto3.mern.gouv.qc.ca/geoserver/SmartFaunePub/ows', {
    layers: 'Zone_chasse_da3_sefaq',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: '© MERN Québec',
    opacity: 0.7
}).addTo(map); // Show by default

// 2. Terres Publiques / Domanialité (MFFP) - Public Crown Lands
// Using a different WMS endpoint that shows public vs private lands more clearly
const publicLandsLayer = L.tileLayer.wms('https://servicescarto.mffp.gouv.qc.ca/pes/services/Forets/STF_WMS/MapServer/WMSServer', {
    layers: '0,1,3,4', // Public provincial, federal forests at different scales
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: '© MFFP Québec',
    opacity: 0.5
}).addTo(map); // Show by default

// 3. Terres de la Couronne (Crown Lands) - Official layer
// This shows the official Crown Lands boundaries
const crownLandsLayer = L.tileLayer.wms('https://servicescarto.mffp.gouv.qc.ca/pes/services/Territoire/Ter_Pub_Prive/MapServer/WMSServer', {
    layers: '0,1,2', // Terre publique, Terre privée, Limite
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: '© MFFP Québec',
    opacity: 0.6
}).addTo(map); // Show by default

// 4. ZEC and Reserves Layer
const zecLayer = L.tileLayer.wms('https://servicesvecto3.mern.gouv.qc.ca/geoserver/SmartFaunePub/ows', {
    layers: 'SmartFaunePub:zec_sefaq',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: '© MERN Québec',
    opacity: 0.6
});

// 5. Réserves Fauniques (Wildlife Reserves)
const reservesLayer = L.tileLayer.wms('https://servicesvecto3.mern.gouv.qc.ca/geoserver/SmartFaunePub/ows', {
    layers: 'SmartFaunePub:reserve_faunique_sefaq',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: '© MERN Québec',
    opacity: 0.6
});

// Add to Layer Control
const overlays = {
    "🎯 Zones de Chasse": huntingZonesLayer,
    "👑 Terres de la Couronne": crownLandsLayer,
    "🌲 Forêts Publiques": publicLandsLayer,
    "🏕️ ZEC": zecLayer,
    "🦌 Réserves Fauniques": reservesLayer
};

L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

// Add a clear visual legend
const infoBox = L.control({ position: 'bottomright' });
infoBox.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info-legend');
    div.innerHTML = `
        <div style="background: rgba(44, 62, 80, 0.95); padding: 12px; border-radius: 8px; color: white; font-size: 0.85em; max-width: 200px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            <h4 style="margin: 0 0 10px 0; font-size: 1em; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px;">📍 Légende</h4>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="width:18px; height:18px; background:rgba(74, 103, 65, 0.5); border:1px solid #4a6741; display:inline-block; border-radius:3px;"></span>
                <span style="font-size:0.8em;">Terres Publiques</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="width:18px; height:18px; background:rgba(230, 126, 34, 0.5); border:2px solid #e67e22; display:inline-block; border-radius:3px;"></span>
                <span style="font-size:0.8em;">Zones de Chasse</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:18px; height:18px; background:rgba(52, 152, 219, 0.5); border:2px solid #3498db; display:inline-block; border-radius:3px;"></span>
                <span style="font-size:0.8em;">ZEC</span>
            </div>
            <hr style="margin:8px 0; border:0; border-top:1px solid rgba(255,255,255,0.2);">
            <small style="font-size:0.7em; opacity:0.8;">⚠️ Vérifiez la réglementation locale</small>
        </div>
    `;
    return div;
};
infoBox.addTo(map);

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

    // Build popup content with optional photo
    let popupContent = `<b>${data.type.toUpperCase()}</b><br>${data.desc}`;
    if (data.photo) {
        popupContent = `
            <div style="text-align: center;">
                <img src="${data.photo}" style="max-width: 200px; max-height: 150px; border-radius: 6px; margin-bottom: 8px;">
                <br><b>${data.type.toUpperCase()}</b><br>${data.desc}
            </div>
        `;
    }

    marker.bindPopup(popupContent);
    return marker;
};

// 2. Add Pin Mode
const btnAddPin = document.getElementById('btn-add-pin');
btnAddPin.addEventListener('click', () => {
    isAddPinMode = !isAddPinMode;
    btnAddPin.classList.toggle('active', isAddPinMode);
    document.getElementById('map').style.cursor = isAddPinMode ? 'crosshair' : '';

    // Disable measure mode if active
    if (isAddPinMode && isMeasureMode) {
        isMeasureMode = false;
        document.getElementById('btn-measure').classList.remove('active');
        clearMeasurement();
    }
});

// 2b. Distance Measurement Tool
const btnMeasure = document.getElementById('btn-measure');
btnMeasure.addEventListener('click', () => {
    isMeasureMode = !isMeasureMode;
    btnMeasure.classList.toggle('active', isMeasureMode);

    if (!isMeasureMode) {
        clearMeasurement();
        document.getElementById('map').style.cursor = '';
    } else {
        document.getElementById('map').style.cursor = 'crosshair';
        // Disable pin mode if active
        if (isAddPinMode) {
            isAddPinMode = false;
            btnAddPin.classList.remove('active');
        }
    }
});

function clearMeasurement() {
    // Remove line
    if (measureLine) {
        map.removeLayer(measureLine);
        measureLine = null;
    }
    // Remove markers
    measureMarkers.forEach(marker => map.removeLayer(marker));
    measureMarkers = [];
    measurePoints = [];
}

function calculateDistance(latlngs) {
    let totalDistance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
        totalDistance += map.distance(latlngs[i], latlngs[i + 1]);
    }
    return totalDistance;
}

function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    } else {
        return `${(meters / 1000).toFixed(2)} km`;
    }
}

// Map Click Event
map.on('click', (e) => {
    // Handle Pin Mode
    if (isAddPinMode) {
        const { lat, lng } = e.latlng;
        document.getElementById('modal-add-pin').classList.remove('hidden');
        tempMarker = { lat, lng };
        return;
    }

    // Handle Measure Mode
    if (isMeasureMode) {
        const { lat, lng } = e.latlng;
        measurePoints.push([lat, lng]);

        // Add small marker at click point
        const pointMarker = L.circleMarker([lat, lng], {
            radius: 5,
            color: '#e67e22',
            fillColor: '#e67e22',
            fillOpacity: 1,
            weight: 2
        }).addTo(map);
        measureMarkers.push(pointMarker);

        // Draw or update line
        if (measurePoints.length > 1) {
            if (measureLine) {
                map.removeLayer(measureLine);
            }

            measureLine = L.polyline(measurePoints, {
                color: '#e67e22',
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 5'
            }).addTo(map);

            // Calculate and show distance
            const distance = calculateDistance(measurePoints);
            const popupContent = `
                <div style="text-align: center;">
                    <b>📏 Distance Totale</b><br>
                    <span style="font-size: 1.2em; color: #e67e22;">${formatDistance(distance)}</span><br>
                    <small>${measurePoints.length} points</small><br>
                    <button onclick="clearMeasurement()" style="margin-top: 5px; padding: 3px 8px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Effacer</button>
                </div>
            `;
            measureLine.bindPopup(popupContent).openPopup();
        }
    }
});

// Modal Logic
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('modal-add-pin').classList.add('hidden');
});

// Photo preview handler
document.getElementById('pin-photo').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('preview-img').src = event.target.result;
            document.getElementById('photo-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('form-add-pin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = document.getElementById('pin-type').value;
    const desc = document.getElementById('pin-desc').value;
    const photoInput = document.getElementById('pin-photo');

    if (tempMarker) {
        const markerData = {
            id: Date.now(),
            lat: tempMarker.lat,
            lng: tempMarker.lng,
            type,
            desc
        };

        // Handle photo if uploaded
        if (photoInput.files && photoInput.files[0]) {
            const compressedPhoto = await compressImage(photoInput.files[0]);
            markerData.photo = compressedPhoto;
        }

        markers.push(markerData);
        localStorage.setItem('hunting_markers', JSON.stringify(markers));

        addMarkerToMap(markerData);
        updateMarkersList();

        // Reset
        document.getElementById('modal-add-pin').classList.add('hidden');
        document.getElementById('form-add-pin').reset();
        document.getElementById('photo-preview').style.display = 'none';

        // Disable mode after adding
        isAddPinMode = false;
        btnAddPin.classList.remove('active');
        document.getElementById('map').style.cursor = '';
    }
});

// Image compression function
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 with compression
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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
                style: { color: 'purple', weight: 2 }
            }).addTo(map);
            map.fitBounds(layer.getBounds());
            alert("Fichier importé avec succès !");
        } catch (err) {
            alert("Erreur lors de la lecture du fichier. Assurez-vous que c'est un GeoJSON valide.");
            console.error(err);
        }
    };
    reader.readAsText(file);
});

// 5. Geolocation - Always show user location
document.getElementById('btn-locate').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 14 });
});

// Auto-locate on page load
map.locate({ setView: false, watch: true, enableHighAccuracy: true });

map.on('locationfound', (e) => {
    // Remove old marker if exists
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }

    // Add accuracy circle
    const radius = e.accuracy / 2;
    L.circle(e.latlng, {
        radius: radius,
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.15,
        weight: 2
    }).addTo(map);

    // Add user marker with custom icon
    userLocationMarker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #3498db; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        })
    }).addTo(map);

    userLocationMarker.bindPopup("📍 Vous êtes ici");
});

map.on('locationerror', (e) => {
    console.log("Geolocation error:", e.message);
});

// 6. Weather Data
async function fetchWeather(lat, lon) {
    // Using Open-Meteo (free, no API key required!)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=America/Toronto`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.current) {
            displayWeather(data);
        }
    } catch (error) {
        console.error("Weather fetch error:", error);
        document.getElementById('weather-loading').innerHTML = '<small style="color: #e74c3c;">Météo indisponible</small>';
    }
}

function displayWeather(data) {
    const current = data.current;
    const daily = data.daily;

    // Temperature
    document.getElementById('weather-temp').textContent = `${Math.round(current.temperature_2m)}°C`;

    // Weather description and icon
    const weatherInfo = getWeatherInfo(current.weather_code);
    document.getElementById('weather-desc').textContent = weatherInfo.desc;
    document.getElementById('weather-icon').textContent = weatherInfo.icon;

    // Wind
    const windKmh = Math.round(current.wind_speed_10m * 3.6); // m/s to km/h
    document.getElementById('weather-wind').textContent = `${windKmh} km/h`;

    // Wind direction
    const windDir = getWindDirection(current.wind_direction_10m);
    document.getElementById('weather-wind-dir').textContent = windDir;

    // Sunrise/Sunset
    const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(daily.sunset[0]).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('weather-sun').textContent = `${sunrise} / ${sunset}`;

    // Show weather data, hide loading
    document.getElementById('weather-loading').style.display = 'none';
    document.getElementById('weather-data').style.display = 'block';
}

function getWeatherInfo(code) {
    const weatherCodes = {
        0: { desc: 'Ciel dégagé', icon: '☀️' },
        1: { desc: 'Principalement dégagé', icon: '🌤️' },
        2: { desc: 'Partiellement nuageux', icon: '⛅' },
        3: { desc: 'Couvert', icon: '☁️' },
        45: { desc: 'Brouillard', icon: '🌫️' },
        48: { desc: 'Brouillard givrant', icon: '🌫️' },
        51: { desc: 'Bruine légère', icon: '🌦️' },
        61: { desc: 'Pluie légère', icon: '🌧️' },
        63: { desc: 'Pluie modérée', icon: '🌧️' },
        65: { desc: 'Pluie forte', icon: '⛈️' },
        71: { desc: 'Neige légère', icon: '🌨️' },
        73: { desc: 'Neige modérée', icon: '❄️' },
        75: { desc: 'Neige forte', icon: '❄️' },
        95: { desc: 'Orage', icon: '⛈️' }
    };
    return weatherCodes[code] || { desc: 'Variable', icon: '🌤️' };
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Fetch weather on location found
map.on('locationfound', (e) => {
    // Remove old marker if exists
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }

    // Add accuracy circle
    const radius = e.accuracy / 2;
    L.circle(e.latlng, {
        radius: radius,
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.15,
        weight: 2
    }).addTo(map);

    // Add user marker with custom icon
    userLocationMarker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #3498db; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        })
    }).addTo(map);

    userLocationMarker.bindPopup("📍 Vous êtes ici");

    // Fetch weather for this location
    fetchWeather(e.latlng.lat, e.latlng.lng);
});

// Init
loadSavedMarkers();

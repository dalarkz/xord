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

        // Disable mode after adding
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

// Init
loadSavedMarkers();

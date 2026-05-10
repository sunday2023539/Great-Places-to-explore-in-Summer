// ===============================
// Great Places to Explore in Summer
// ===============================

// Create map
var map = L.map("map", {
  center: [47.7981, 13.0501],
  zoom: 13,
  zoomControl: false
});

// Zoom control
L.control.zoom({
  position: "topleft"
}).addTo(map);

// Base maps
var cleanMap = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 20
  }
).addTo(map);

var osm = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
);

var baseMaps = {
  "Clean Map": cleanMap,
  "OpenStreetMap": osm
};

// Scale bar
L.control.scale({
  position: "bottomright",
  imperial: false
}).addTo(map);

// ===============================
// CATEGORY SETTINGS
// ===============================

var categories = {
  playgrounds: {
    label: "Playgrounds",
    data: spielplatz,
    iconUrl: "data/spielplatz.png",
    color: "#16a34a",
    cluster: null,
    count: 0
  },
  wifi: {
    label: "WiFi Hotspots",
    data: wlanhotspot,
    iconUrl: "data/wlanhotspot.png",
    color: "#0284c7",
    cluster: null,
    count: 0
  },
  museums: {
    label: "Museums",
    data: museum,
    iconUrl: "data/museum.png",
    color: "#ea580c",
    cluster: null,
    count: 0
  },
  libraries: {
    label: "Libraries",
    data: bibliothek,
    iconUrl: "data/bibliothek.png",
    color: "#7c3aed",
    cluster: null,
    count: 0
  }
};

var allSearchMarkers = [];

// ===============================
// ICONS
// ===============================

function createIcon(iconUrl) {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
}

// ===============================
// CUSTOM CLUSTER STYLE
// ===============================

function createClusterGroup(color) {
  return L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 45,
    iconCreateFunction: function (cluster) {
      return L.divIcon({
        html: `<div style="background:${color};">${cluster.getChildCount()}</div>`,
        className: "custom-cluster",
        iconSize: L.point(42, 42)
      });
    }
  });
}

// ===============================
// POPUP
// ===============================

function cleanText(text) {
  if (!text) return "No description available.";
  return String(text);
}

function createPopup(feature, category) {
  var description = cleanText(feature.properties.description);
  var title =
    feature.properties.name ||
    feature.properties.Name ||
    feature.properties.title ||
    feature.properties.TITLE ||
    category.label;

  return `
    <div class="popup-card">
      <div class="popup-category" style="background:${category.color};">
        ${category.label}
      </div>

      <h3>${title}</h3>

      <p>${description}</p>

      <a class="popup-btn"
         href="https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}"
         target="_blank">
        Get Directions
      </a>
    </div>
  `;
}

// ===============================
// ADD DATA TO MAP
// ===============================

function addCategoryToMap(categoryKey) {
  var category = categories[categoryKey];

  var icon = createIcon(category.iconUrl);
  var clusterGroup = createClusterGroup(category.color);

  var geojsonLayer = L.geoJSON(category.data, {
    pointToLayer: function (feature, latlng) {
      var marker = L.marker(latlng, { icon: icon });

      marker.featureData = feature;
      marker.categoryKey = categoryKey;

      allSearchMarkers.push(marker);

      return marker;
    },

    onEachFeature: function (feature, layer) {
      layer.bindPopup(createPopup(feature, category));

      layer.on("click", function () {
        layer.openPopup();
      });
    }
  });

  clusterGroup.addLayer(geojsonLayer);
  clusterGroup.addTo(map);

  category.cluster = clusterGroup;
  category.count = geojsonLayer.getLayers().length;
}

Object.keys(categories).forEach(addCategoryToMap);

// ===============================
// LAYER CONTROL
// ===============================

var overlayMaps = {};

Object.keys(categories).forEach(function (key) {
  overlayMaps[categories[key].label] = categories[key].cluster;
});

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false,
  position: "topright"
}).addTo(map);

// ===============================
// LOCATE ME
// ===============================

if (L.control.locate) {
  L.control.locate({
    position: "topleft",
    strings: {
      title: "Show my location"
    },
    flyTo: true
  }).addTo(map);
}

// ===============================
// FIT TO ALL FEATURES
// ===============================

function zoomToAll() {
  var visibleLayers = [];

  Object.keys(categories).forEach(function (key) {
    if (map.hasLayer(categories[key].cluster)) {
      visibleLayers.push(categories[key].cluster);
    }
  });

  if (visibleLayers.length > 0) {
    var group = L.featureGroup(visibleLayers);

    map.fitBounds(group.getBounds(), {
      padding: [40, 40]
    });
  }
}

setTimeout(zoomToAll, 500);

// ===============================
// SIDEBAR CHECKBOX FILTERS
// ===============================

function setupFilter(checkboxId, categoryKey) {
  var checkbox = document.getElementById(checkboxId);

  if (!checkbox) return;

  checkbox.checked = true;

  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      map.addLayer(categories[categoryKey].cluster);
    } else {
      map.removeLayer(categories[categoryKey].cluster);
    }

    updateStats();
  });
}

setupFilter("filter-playgrounds", "playgrounds");
setupFilter("filter-wifi", "wifi");
setupFilter("filter-museums", "museums");
setupFilter("filter-libraries", "libraries");

// ===============================
// SEARCH
// ===============================

var searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keyup", function () {
    var query = searchInput.value.toLowerCase().trim();

    if (query.length < 2) return;

    var foundMarker = allSearchMarkers.find(function (marker) {
      var props = marker.featureData.properties || {};
      var text = JSON.stringify(props).toLowerCase();
      return text.includes(query);
    });

    if (foundMarker) {
      map.setView(foundMarker.getLatLng(), 17);
      foundMarker.openPopup();
    }
  });
}

// ===============================
// STATS
// ===============================

function updateStats() {
  var total = 0;
  var visible = 0;

  Object.keys(categories).forEach(function (key) {
    total += categories[key].count;

    if (map.hasLayer(categories[key].cluster)) {
      visible += categories[key].count;
    }
  });

  setText("totalPlaces", total);
  setText("visiblePlaces", visible);
  setText("countPlaygrounds", categories.playgrounds.count);
  setText("countWifi", categories.wifi.count);
  setText("countMuseums", categories.museums.count);
  setText("countLibraries", categories.libraries.count);
}

function setText(id, value) {
  var element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

updateStats();

// ===============================
// MAP INFORMATION BAR
// ===============================

function updateMapInfo(e) {
  if (e && e.latlng) {
    setText("latValue", e.latlng.lat.toFixed(4));
    setText("lngValue", e.latlng.lng.toFixed(4));
  }

  setText("zoomValue", map.getZoom());
}

map.on("mousemove", updateMapInfo);
map.on("zoomend", updateMapInfo);

// ===============================
// Optional buttons
// ===============================

var zoomAllBtn = document.getElementById("zoomAllBtn");
if (zoomAllBtn) {
  zoomAllBtn.addEventListener("click", zoomToAll);
}

var clearFiltersBtn = document.getElementById("clearFiltersBtn");
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", function () {
    Object.keys(categories).forEach(function (key) {
      if (!map.hasLayer(categories[key].cluster)) {
        map.addLayer(categories[key].cluster);
      }
    });

    ["filter-playgrounds", "filter-wifi", "filter-museums", "filter-libraries"].forEach(function (id) {
      var checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = true;
    });

    updateStats();
  });
}
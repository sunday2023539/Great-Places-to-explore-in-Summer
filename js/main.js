//Creating a map with Leaflet and adding interactive controls
//Creating the map involves setting the central location (geographic coordinates) and zoom level, which are properties of the Leaflet map object L.map.
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [47.7981, 13.0501],
	zoom: 13
});


// add open street map as base layer
var osmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);




// for using the two base maps in the layer control, I defined a baseMaps variable
var baseMaps = {
	"OpenStreetMap": osmap,
   }

//
//---- Adding a scale bar
//

L.control.scale({position:'topleft',imperial:false}).addTo(map);


//var currentClickedMarker = null;

// Define custom icons
var icons = [
    L.icon({
        iconUrl: 'data/spielplatz.png',
        iconSize: [25, 25],
    }),
    L.icon({
        iconUrl: 'data/wlanhotspot.png',
        iconSize: [25, 25],
    }),
    L.icon({
        iconUrl: 'data/museum.png',
        iconSize: [25, 25],
    }),
    L.icon({
        iconUrl: 'data/bibliothek.png',
        iconSize: [25, 25],
    })
];


var enlargedIcons = [
	L.icon({
        iconUrl: 'data/spielplatz.png',
        iconSize: [35, 35],
        iconAnchor: [15, 49]
    }),
    L.icon({
        iconUrl: 'data/wlanhotspot.png',
        iconSize: [35, 35],
        iconAnchor: [15, 49]
    }),
    L.icon({
        iconUrl: 'data/museum.png',
        iconSize: [35, 35],
        iconAnchor: [15, 49]
    }),
    L.icon({
        iconUrl: 'data/bibliothek.png',
        iconSize: [35, 35],
        iconAnchor: [15, 49]
    })
];

//var currentClickedMarker = null;


var layers = {};

var geojsonDataArray = [
    { name: 'spielplatz', data: spielplatz },
    { name: 'wlanhotspot', data: wlanhotspot },
    { name: 'museum', data: museum },
    { name: 'bibliothek', data: bibliothek }
];

for (let i = 0; i < geojsonDataArray.length; i++) {
    addGeoJSONToMap(geojsonDataArray[i].data, geojsonDataArray[i].name, icons[i], enlargedIcons[i]);
}

function addGeoJSONToMap(geojsonData, layerName, icon, enlargedIcon) {
    var layer = L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: icon });
        },
         onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.description) {
                // Add a popup with the feature's description
                //layer.bindPopup(feature.properties.description);

                // Change icon size on mouseover and mouseout
                //layer.on('mouseover', function (e) {
                    //layer.setIcon(enlargedIcon);
                   //currentHoveredMarker = layer;
				//});
                //layer.on('mouseout', function (e) {
                    //layer.setIcon(icon);
               // });

                }
            if (feature.properties && feature.properties.description) {
                layer.on('click', function () {

                    if (!layer._popup) {
                        layer.bindPopup(feature.properties.description).openPopup();

                    }
                });
            }
        }
    }).addTo(map);

    // Add the layer to the layers object for control
    layers[layerName] = layer;
}

L.control.layers(null, layers).addTo(map);


//when you click in the map, an alert with the latitude and longitude coordinates of the click location is shown
// e is the event object that is created on mouse click


map.addEventListener('dblclick', function (e) {
    alert(e.latlng);
});





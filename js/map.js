var map;
var idInfoBoxAberto;
var infoBox = [];
var markers = [];
var latitude;
var longitude;


function initialize() {

    var options = {
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(40.763328, -73.968039)); //boundaries of Gotham.
    bounds.extend(new google.maps.LatLng(40.746422, -73.994753)); //boundaries of Gotham.
    map = new google.maps.Map(document.getElementById("mapa"), options);
    //Buscabox();
}

initialize();

function abrirInfoBox(place, marker) {
    if (typeof(idInfoBoxAberto) == 'number' && typeof(infoBox[idInfoBoxAberto]) == 'object') {
        infoBox[idInfoBoxAberto].close();
    }

    infoBox[place].open(map, marker);
    idInfoBoxAberto = place;
}

function MakePontos() {

    $.getJSON('js/target.json', function(pontos) {

        var latlngbounds = new google.maps.LatLngBounds();

        $.each(pontos, function(index, ponto) {

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.lat, ponto.lng),
                title: ponto.place,
                icon: 'img/batsi.png'
            });

            var myOptions = {
                content: "<p>" + ponto.place + "</p>",
                pixelOffset: new google.maps.Size(-150, 0)
            };

            infoBox[ponto.place] = new InfoBox(myOptions);
            infoBox[ponto.place].marker = marker;

            infoBox[ponto.place].listener = google.maps.event.addListener(marker, 'click', function(e) {
                abrirInfoBox(ponto.place, marker);
            });

            markers.push(marker);

            latlngbounds.extend(marker.position);

        });

        var markerCluster = new MarkerClusterer(map, markers);

        map.fitBounds(latlngbounds);

    });

}

MakePontos();
/*
function Buscabox() {
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.763328, -73.968039),
        new google.maps.LatLng(40.746422, -73.994753));
    var searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'), { bounds: defaultBounds });
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('pac-input'));
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        searchBox.set('map', null);


        var places = searchBox.getPlaces();

        var bounds = new google.maps.LatLngBounds();


        var i, place;
        for (i = 0; place = places[i]; i++) {
            (function(place) {
                var marker = new google.maps.Marker({

                    position: place.geometry.location
                });
                marker.bindTo('map', searchBox, 'map');
                google.maps.event.addListener(marker, 'map_changed', function() {
                    if (!this.getMap()) {
                        this.unbindAll();
                    }
                });
                bounds.extend(place.geometry.location);


            }(place));

        }
        map.fitBounds(bounds);
        searchBox.set('map', map);
        map.setZoom(Math.min(map.getZoom(), 12));

        //	 new google.maps.places.SearchBox(input, {bounds: defaultBounds});

    });
}

*/
function getLatLong(address) {
    var geo = new google.maps.Geocoder;

    geo.geocode({ 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            console.log(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();
        } else {
            alert("Address search was not successful for the following reason: " + status);
        }

    });

}

function find_closest_Atk(lat1, lon1) {
    var pi = Math.PI;
    var R = 6371; //equatorial radius
    var distances = [];
    var closest = -1;

    for (i = 0; i < markers.length; i++) {
        var lat2 = markers[i].position.lat();
        var lon2 = markers[i].position.lng();

        var chLat = lat2 - lat1;
        var chLon = lon2 - lon1;

        var dLat = chLat * (pi / 180);
        var dLon = chLon * (pi / 180);

        var rLat1 = lat1 * (pi / 180);
        var rLat2 = lat2 * (pi / 180);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        distances[i] = d;
        if (closest == -1 || d < distances[closest]) {
            closest = i;
        }
    }


    console.log(markers[closest].title);
    document.getElementById("atak").innerHTML = "Probably the next attack will be on : " + markers[closest].title +
        ", and the villain is currently in : " + document.getElementById("pac-input").value;
}

function clicou() {
    clearLatLng();
    var inputOne = document.getElementById("pac-input").value;
    if (inputOne.replace(/\s/g, "") == "") {
        alert("still no address inserted");
    } else {
        getLatLong(inputOne);
        find_closest_Atk(latitude, longitude);
    }
}

function clearLatLng() {
    delete latitude;
    delete longitude;
    delete closest;
}


//google.maps.event.addListener(map, 'click', find_closest_marker);
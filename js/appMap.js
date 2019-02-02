/**
* AppMap is used between ko and the MapProvider
* the idea of the AppMap is, if we want to add an other MapProvider 
* like Openstreetmap we would only have to programm the new OpenstreetmapProvider and make sure
* all the called methods in AppMap are defined and do what they supposed to do..
*/
var AppMap = function(provider) {

    this.mapProvider = provider;
    this.locations = [];
    this.vm = null;

    //set all locations 
    this.setLocations = function(locations) {
      this.locations = locations;
    }

    //initlalize all locations
    this.init = function(){
      for(var i = 0; i < this.locations.length; i++){
        this.mapProvider.initLocation(this.locations[i]);
      }
      this.showLocations(this.locations);
    }

    // if a location should be highligthed
    this.highlightLocation = function(location){
      this.mapProvider.highlightLocation(location);
    }

    //set the current location
    this.setCurrentLocation = function(location){
      this.mapProvider.setCurrentLocation(location);
    }

    // show the defined locations on the map
    this.showLocations = function(locations){
      this.mapProvider.hideAllLocations();
      this.mapProvider.showLocations(locations);
    }
}

/*
* Map Provider for GoogleMaps
* Contains all GoogleMaps specific functions.
*/
var GoogleMapsProvider = function(map){
  // the acutal googlemaps object
  this.map = map
  //list of markers
  this.markers = [];
  //list of infowindows for the markers
  this.infowindows = [];
  // the streetview Service
  this.streetViewService = new google.maps.StreetViewService();
  // a maximal zoom defined so it's zoom not to near
  this.maxZoom = 17;

  // functin for the icons
  this.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  // define the icons
  this.normalIcon = this.makeMarkerIcon('64d5ca');
  this.highlightedIcon = this.makeMarkerIcon('e3342f');

  /*
  * Intialise a location
  */
  this.initLocation = function(location){

      // if the tilesloaded event is fired, do not display the loader anymore
      google.maps.event.addListener(this.map, 'tilesloaded', function(){
        document.getElementById("loader").style.display = "none";
      });

      //define the marker of the location
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.getLat(), location.getLng()),
        title: location.getName(),
        animation: google.maps.Animation.DROP,
        icon: this.normalIcon,
        id: location.getId()
      });

      marker.addListener('click', function() {
        vm.setCurrentLocation(location)
      });

      // Infowindows 
      var contentString = '<div class="infowindow">'
      + '<h1 >'+location.getName()+'</h1>'
      + '<div>'
      + location.getDescription()
      + '<div id="streetview"></div></div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString,
        id: location.getId()
      });

      //push the marker an the infowindo the the array.
      this.markers.push(marker);
      this.infowindows.push(infowindow);
  }

  /*
  * Loads the Streetview if a location infowindow gets open.
  */
  this.loadMarkerStreetview = function(marker){ 
    // Find street view within 100 meters
    let meters = 100;
    this.streetViewService.getPanoramaByLocation(marker.getPosition(), meters, function(result, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var panoramaOptions = {
        position: result.location.latLng
      };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('streetview'), panoramaOptions);
      }
      else {
        // if no street view availble, pass the info to the streetview element.
        document.getElementById('streetview').innerHTML = ('<p class="m-5 text-red">No street view is available within ' + meters + ' meters</p>');
        return;
      }
    });
  }

  /*
  * highlight's a location with bouncing for 2s
  */
  this.highlightLocation = function(location,time = 2000){
    
    // first stop all markers animations or special icon's
    let i = 0;
    for(i = 0; i < this.markers.length; i ++){
      marker = this.markers[i];
      marker.setAnimation(null);
      marker.setIcon(this.normalIcon);
    }

    // now search for the marker of the explizit location
    marker = this.getMarkerByLocation(location);
    //let the marker bounce 
    marker.setAnimation(google.maps.Animation.BOUNCE);
    marker.setIcon(this.highlightedIcon);
    // pass the marker and icon over a closure for the the setTimeout function
    (function(marker,icon,time){
      var marker = marker;
      var icon = icon;

      // if the time is set to 0 it will not autmatically disable the the higlighted icon and animation
      if(time > 0){
        //console.log(icon);
        setTimeout(function(){

          // check if a current location is activ
          if(vm.currentLocation()){
            // if the current location is the same as marker then do not stop the animation
            if(marker.id == vm.currentLocation().id){
              return;
            }
          }
          else {
            marker.setAnimation(null);
           // console.log(icon);
            marker.setIcon(icon);  
          }

        }, time);
      }
    })(marker,this.normalIcon,time);    
  }

  /*
  * Hide all Locations
  */
  this.hideAllLocations = function(){
    let i = 0;
    for(i = 0; i < this.markers.length; i ++){
      this.markers[i].setMap(null);
    }
  }

  /*
  * show the passed locations
  */
  this.showLocations = function(locations){

    // show and center map only if there is at least one location found:
    if(locations.length > 0){
      let bounds = new google.maps.LatLngBounds();
      let i = 0;
      //interate over the locatins and bind them to the map an to the bounds.
      for(i = 0; i < locations.length; i++){
        marker = this.getMarkerByLocation(locations[i]);
      //  console.log("run" + i + " id:" + locations[i].getId());
        marker.setMap(this.map);
        bounds.extend(marker.position);
      }

      this.map.fitBounds(bounds);
      // prefer to zoom one step furher away than acutally google does
      // gives a better overview
      this.map.setZoom(this.map.getZoom()-1);

      if(this.map.getZoom() > this.maxZoom){
        this.map.setZoom(this.maxZoom);
      } 
    }
  }

  /*
  * set the current location
  * open the infowindow for this location an center the location on the map
  */
  this.setCurrentLocation = function(location){

    // first close all other infowindows
    this.closeAllInfowindows();
    // get the marker of the given location
    marker = this.getMarkerByLocation(location);

    // set the bounds to the current location (for centering)
    bounds = new google.maps.LatLngBounds();
    bounds.extend(marker.position);

    //prefer to stay at the same zoom level becaus its just one marker
    zoomBeforeFitBound = this.map.getZoom();

    // center the map to the marker
    this.map.fitBounds(bounds);

    // Zoom out again so the user has still the same overview like before
    this.map.setZoom(zoomBeforeFitBound);

    // highlight the location and let the it jumping.
    this.highlightLocation(location,0);

    // add an listener to the infowindow
    infowindow =  this.getInfowindowByLocation(location);
    infowindow.open(this.map, marker);
    infowindow.addListener('closeclick',function(){
      vm.setCurrentLocation(null);
    });

    // load the streetview
    this.loadMarkerStreetview(marker);
  }

  /*
  * closes all infowindows
  */
  this.closeAllInfowindows = function() {
    for(i = 0; i < this.infowindows.length; i ++){
      this.infowindows[i].close();
    }
  }

  /*
  * search the marker for a given location
  */
  this.getMarkerByLocation = function(location){
    //make sure local scope is used
    let i = 0;
    for(i = 0; i < this.markers.length; i ++){
      if(this.markers[i].id == location.getId()){
        return this.markers[i];
      } 
    }
    return null;
  }

  /*
  * search the infowindow for a given location
  */
  this.getInfowindowByLocation = function(location){
    //make sure local scope is used
    let i = 0;
    for(i = 0; i < this.infowindows.length; i ++){
      if(this.infowindows[i].id == location.getId()){
        return this.infowindows[i];
      } 
    }
    return null;
  }
}

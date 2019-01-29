var AppMap = function(provider) {

    this.mapProvider = provider;
    this.locations = [];
    this.vm = null;

    this.setLocations = function(locations) {
      this.locations = locations;
    }

    this.bindViewModel = function(vm){
      this.vm = vm;
    }

    this.init = function(){
      for(var i = 0; i < this.locations.length; i++){
        this.mapProvider.init(this.locations[i]);
      }
      mapProvider.showLocations(this.locations);
    }

    this.highlightLocation = function(location){
      this.mapProvider.highlightLocation(location);
    }

    this.deHighlightLocation = function(location){
      this.mapProvider.deHighlightLocation(location);
    }

    this.setCurrentLocation = function(location){
      this.mapProvider.setCurrentLocation(location);
    }

    this.showLocations = function(locations){
      this.mapProvider.hideAllLocations();
      this.mapProvider.showLocations(locations);
    }
}


var GoogleMapsProvider = function(map){
  this.map = map
  this.markers = [];
  this.infowindows = [];
  this.streetViewService = new google.maps.StreetViewService();
  this.maxZoom = 17;
  this.normalIcon = null;
  this.highlightedIcon = null;


  this.init = function(location){

      this.normalIcon = this.makeMarkerIcon('64d5ca');
      this.highlightedIcon = this.makeMarkerIcon('e3342f');

      google.maps.event.addListener(this.map, 'tilesloaded', function(){
        document.getElementById("loader").style.display = "none";
      });

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.getLat(), location.getLng()),
        title: location.getName(),
        //animation: google.maps.Animation.DROP,
        icon: this.normalIcon,
        id: location.getId()
      });

       var contentString = '<div class="infowindow">'
       + '<h1 >'+location.getName()+'</h1>'
       + '<div>'
       + location.getDescription()
       + '<div id="streetview"></div></div>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString,
          id: location.getId()
        });

       provider = this;

       marker.addListener('click', function() {
        //   provider.closeAllInfowindows();
        //   infowindow.open(this.map, marker);
        //   provider.loadMarkerStreetview(marker);

          vm.setCurrentLocation(location)
          // provider.loadWikipediaArticles(location);
      });



      this.markers.push(marker);
      this.infowindows.push(infowindow);
  }

  this.loadMarkerStreetview = function(marker){ 
    // Find street view within 500 meters
    //var service = new google.maps.StreetViewService();
    this.streetViewService.getPanoramaByLocation(marker.getPosition(), 200, function(result, status) {
          if (status == google.maps.StreetViewStatus.OK) {

       var panoramaOptions = {
                  position: result.location.latLng
                };
        var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('streetview'), panoramaOptions);
          }
          else {
            alert("No street view is available within " + 200 + " meters");
            return;
          }
      });
  }

  this.highlightLocation = function(location){
    
    let i = 0;
    for(i = 0; i < this.markers.length; i ++){
      marker = this.markers[i];
      marker.setAnimation(null);
      marker.setIcon(this.normalIcon);
    }



    marker = this.getMarkerByLocation(location);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    marker.setIcon(this.highlightedIcon);
    (function(marker,icon){

      var marker = marker;
      var icon = icon;

      setTimeout(function(){

        marker.setAnimation(null);
        marker.setIcon(icon);
      }, 2000);
    })(marker,this.normalIcon);    
  }


  this.hideAllLocations = function(){
    let i = 0;
    for(i = 0; i < this.markers.length; i ++){
      this.markers[i].setMap(null);
    }
  }

  this.showLocations = function(locations){

  
    // show and center map only if there is at least one location found:
    if(locations.length > 0){
      let bounds = new google.maps.LatLngBounds();
      let i = 0;
      for(i = 0; i < locations.length; i++){
        marker = this.getMarkerByLocation(locations[i]);
        console.log("run" + i + " id:" + locations[i].getId());
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

  this.setCurrentLocation = function(location){
    this.closeAllInfowindows();
    marker = this.getMarkerByLocation(location);

    bounds = new google.maps.LatLngBounds();
    bounds.extend(marker.position);

    //prefer to stay at the same zoom level becaus its just one marker
    zoomBeforeFitBound = this.map.getZoom();

    this.map.fitBounds(bounds);
    this.map.setZoom(zoomBeforeFitBound);

    
    this.highlightLocation(location);
    this.getInfowindowByLocation(location).open(this.map, marker);
    this.loadMarkerStreetview(marker);
  }

  this.closeAllInfowindows = function() {
    for(i = 0; i < this.infowindows.length; i ++){
      this.infowindows[i].close();
    }
  }

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


}

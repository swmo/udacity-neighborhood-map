var AppMap = function(provider) {

  	this.mapProvider = provider;
  	this.locations = [];

  	this.setLocations = function(locations) {
  		this.locations = locations;
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

  	this.selectLocation = function(location){
  		this.mapProvider.selectLocation(location);
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

	this.init = function(location){

      google.maps.event.addListener(this.map, 'tilesloaded', function(){
        document.getElementById("loader").style.display = "none";
      });

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.getLat(), location.getLng()),
        title: location.getName(),
        //animation: google.maps.Animation.DROP,
        //icon: defaultIcon,
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
		   provider.closeAllInfowindows();
		   infowindow.open(this.map, marker);
		   provider.loadMarkerStreetview(marker);
	    });

      this.markers.push(marker);
      this.infowindows.push(infowindow);
	}

	this.loadMarkerStreetview = function(marker){	
		// Find street view within 500 meters
		var service = new google.maps.StreetViewService();
		service.getPanoramaByLocation(marker.getPosition(), 200, function(result, status) {
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
		this.getMarkerByLocation(location).setAnimation(google.maps.Animation.BOUNCE);
	}

	this.deHighlightLocation = function(location){
		this.getMarkerByLocation(location).setAnimation(null);
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

	this.selectLocation = function(location){

		this.closeAllInfowindows();

		marker = this.getMarkerByLocation(location);
		marker.setAnimation(google.maps.Animation.DROP);

		bounds = new google.maps.LatLngBounds();
		bounds.extend(marker.position);

		//prefer to stay at the same zoom level becaus its just one marker
		zoomBeforeFitBound = this.map.getZoom();

		this.map.fitBounds(bounds);
		this.map.setZoom(zoomBeforeFitBound);

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
}

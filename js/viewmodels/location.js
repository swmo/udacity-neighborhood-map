
var ViewModel = function(locations) {

	var self = this;

	this.map = null;
    this.search = ko.observable();
    this.locations = ko.observableArray(locations);
    this.showLocationList = ko.observable();

    this.locationsSearchResult = ko.computed(function() {
    	
    	self.showLocationList(true);

        var search = self.search();

        if (search === undefined || search === null) {
        	return this.locations;
        }

        locations = ko.utils.arrayFilter(this.locations, function(location) {
            //if find by name:
             if(location.name().toLowerCase().indexOf(search) >= 0){
             	return true;
             }

            //if find by address
            if(location.address().toLowerCase().indexOf(search) >= 0){
            	return true;
            }

            return false;
        })
        //only execute when a map is binded
        if(this.map != null){

        	this.map.showLocations(locations);
        }
        return locations;
        ;
    });

    self.bindMap = function(map){
    	this.map = map
    }

    self.highlightLocation = function(location) {
    	self.map.highlightLocation(location);
    	//self.lastInterest(place);
    }

    self.selectLocation = function(location){
    	self.map.selectLocation(location);
    	self.showLocationList(false);
    }

    this.toggleLocationList = function(){
    	self.showLocationList(!self.showLocationList());
    }


};
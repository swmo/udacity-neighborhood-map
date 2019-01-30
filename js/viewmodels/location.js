
var ViewModel = function(locations) {

	var self = this;

	this.map = null;
    this.search = ko.observable();
    this.locations = ko.observableArray(locations);
    this.displayLocationList = ko.observable();
    this.currentLocation = ko.observable();
    this.isLoadingWikipedia = ko.observable(false);

    this.locationsSearchResult = ko.computed(function() {
    	
    	self.displayLocationList(true);

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

    self.setCurrentLocation = function(location){
        self.currentLocation(location);
    	self.map.setCurrentLocation(location);
    	self.displayLocationList(false);
        
        // if already some wikipedia Articles loaded (as example open already a marker)
        if(self.currentLocation().wikipediaArticles() == 0){
              self.isLoadingWikipedia(true);
        }
      

        wikipediaUrl = 'https://en.wikipedia.org/w/api.php'
             + '?action=query'
             + '&format=json'
             + '&list=geosearch'
             + '&gscoord='+location.getLat()+'%7C'+location.getLng()
             + '&gsradius=1000'
             + '&gslimit=10';

      
        let currentLocation = self.currentLocation();
        let vm = self;
            jQuery.ajax({
                url: wikipediaUrl,
                dataType: 'jsonp',
                success: function(data) 
                {
                    result = data['query']['geosearch'];
                    if(result.length > 0){
                         jQuery.each(result, function( key, article ) {

                            let callbackSetCurrentLocation = function (article,currentLocation) {
                               currentLocation.wikipediaArticles.push(article);
                               vm.isLoadingWikipedia(false);
                            }

                            let getWikipediaUrl = function (callback,article,currentLocation) {
                                var wikipediaResolvePageidUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&pageids='+article.pageid+'&inprop=url'
                                jQuery.ajax({
                                    url: wikipediaResolvePageidUrl,
                                    dataType: 'jsonp',
                                    success: function(data) 
                                    {
                                        article['url'] = data['query']['pages'][article.pageid]['fullurl'];
                                        callback(article,currentLocation);
                                    }   
                                });
                            }

                            getWikipediaUrl(callbackSetCurrentLocation,article,currentLocation);

                        });
                    }
                    else{
                        vm.isLoadingWikipedia(false);
                        console.log("no wikipedia results found")
                    }
                }
            });

         console.log(self.currentLocation().wikipediaArticles());

    }



    this.toggleLocationList = function(){
    	self.displayLocationList(!self.displayLocationList());
    }



};
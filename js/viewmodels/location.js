
/**
 * ViewModel is used between the model, view (html) and the map. 
 *
 */
var ViewModel = function(locations) {

	var self = this;

    /*
    * binding of AppMap Class, not managed by ko.
    */
	this.map = null;

    /*
    * Searchfield for locations
    */
    this.search = ko.observable();

    /*
    * Contains all locations
    */
    this.locations = ko.observableArray(locations);

    /*
    * bool if the location list / sidebar is visible or not
    */
    this.displayLocationList = ko.observable();

    /*
    * contains the actuall showed location
    */
    this.currentLocation = ko.observable();

    /*
    * bool if the wikipedia api get's called
    */
    this.isLoadingWikipedia = ko.observable(false);


    /*
    * returns the filtered / serached location list
    */
    this.locationsSearchResult = ko.computed(function() {
    	
        //if the search changes, make sure the location list is showed again.
    	self.displayLocationList(true);

        //read the search input field.
        var search = self.search();

        //if the inputfield is empty or undefinded, just return all locations, because of no valid search
        if (search === undefined || search === null) {
        	return this.locations;
        }

        //Filter the list of locatins. for each location the anymouse function gets called
        // if the function return true, it will saved in the locations array.
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


    /*
    * Method to bind the map
    */
    self.bindMap = function(map){
    	this.map = map
    }

    /*
    *  shows the marker with an animation.
    * this function is used for when the user mouseover the locationitems to show them where the mouseover location is.
    */
    self.highlightLocation = function(location) {
    	self.map.highlightLocation(location);
    }

    /*
    *  Set the current location, as soon as the user click an item in the searched list.
    */
    self.setCurrentLocation = function(location){

        //set the current location in ko
        self.currentLocation(location);

        // if the lcoation is null, do not more..
        if (location == null) {
            return;
        }
        // set the current location to the map
    	self.map.setCurrentLocation(location);
        // hide the sidebar / serachlist
    	self.displayLocationList(false);
        
        // if already some wikipedia Articles are loaded in the current location its not necessary tho show the loader.
        if(self.currentLocation().wikipediaArticles() == 0){
              self.isLoadingWikipedia(true);
        }
      
        // url to make an api request to wikipedia for a geosearch wit lat / lng of the location
        wikipediaUrl = 'https://en.wikipedia.org/w/api.php'
             + '?action=query'
             + '&format=json'
             + '&list=geosearch'
             + '&gscoord='+location.getLat()+'%7C'+location.getLng()
             + '&gsradius=1000'
             + '&gslimit=10';

        // Now use the currentLocation and the vm, here a closure could also be useful? 
        let currentLocation = self.currentLocation();
        let vm = self;
            // now call the wikipedia api with jsonp. jsonp is used because of COR (Cross Origin Request)
            jQuery.ajax({
                url: wikipediaUrl,
                dataType: 'jsonp',
                success: function(data) 
                {
                    //get the founded articles
                    result = data['query']['geosearch'];
                    // make sure there is at least 1 article. 
                    if(result.length > 0){
                        //Interate over the founded articles
                         
                         jQuery.each(result, function( key, article ) {

                            // define the callback for each founded article, this callback is fired 
                            // when the the wikipedia Url ajax request is finished.
                            let callbackSetCurrentLocation = function (article,currentLocation) {
                               currentLocation.wikipediaArticles.push(article);
                               vm.isLoadingWikipedia(false);
                            }

                            // closure to request the wikipedia api again and resolve the article's url
                            let getWikipediaUrl = function (callback,article,currentLocation) {
                                var wikipediaResolvePageidUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&pageids='+article.pageid+'&inprop=url'
                                jQuery.ajax({
                                    url: wikipediaResolvePageidUrl,
                                    dataType: 'jsonp',
                                    success: function(data) 
                                    {
                                        //read the article
                                        article['url'] = data['query']['pages'][article.pageid]['fullurl'];
                                        callback(article,currentLocation);
                                    }, 
                                    error: function (request, status, error) {
                                        // alerting is not really needed, because the user will see that's no locations could be founded if all locations have an error.
                                        //alert("Url of the "+article['title']+" could not resolve");
                                        //if an error apears stop showing the wikipedia laoder
                                        vm.isLoadingWikipedia(false);
                                    }
                                });
                            }

                            getWikipediaUrl(callbackSetCurrentLocation,article,currentLocation);

                        });
                    }
                    else{
                        vm.isLoadingWikipedia(false);
                    }
                }, 
                error: function (request, status, error) {
                    // here is no alerting necessary the user dont get an error 
                    // he will just get the message that it couldnt found any location
                    //alert(request.responseText);
                    vm.isLoadingWikipedia(false);
                }
            });
         //console.log(self.currentLocation().wikipediaArticles());
    }

    /*
    * Show and hide the location list
    */
    this.toggleLocationList = function(){
    	self.displayLocationList(!self.displayLocationList());
    }
};

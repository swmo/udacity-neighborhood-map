/**
* START of the Application
**/


/*
* define some demo locations:
*/
locations = [
	 new Location(1,'Kaffeebar & Coworking Space','Nice to drink a beer afer work','Effingerstrasse 10',[46.946030,7.435810])
	,new Location(2,'Berner Münster','Old and nice cathedral','Münsterplatz 1',[46.947456,7.451123])
	,new Location(3,'University of Bern School of Dental Medicine','Dental School where i work as an computer scientist','Freiburgstrasse 7',[46.947356,7.426754])
	,new Location(4,'Eichholz','nice for a sunday barbecue or when you ride the river "aare" with a dinghy ist a good point to get out of the water','Strandweg 49', [46.933980,7.456752])
	,new Location(5,'Stade de Suisse','Soccer Stadion of the bern young boys','Papiermühlestrasse 71', [46.962834,7.465279])
];

// create the viewModel and bind the locations:
vm = new ViewModel(locations || []);
ko.applyBindings(vm);

// as soon as the map is loaded this callback gets fired:
function initMap() {

	// create the mapProvider 
	mapProvider = new GoogleMapsProvider(
			new google.maps.Map(document.getElementById('map'), {
		      center: {lat: 46.94809, lng: 7.44744},
		      zoom: 13,
		      mapTypeControl: false
		    })
	);

	// add the map provider to the AppMap
	map = new AppMap(mapProvider);

	//bind the map to the viewModel, so the viewModel can also execute some changes.
	vm.bindMap(map);
	// set the first locations (if the site gets new loaded all locations are showed)
	map.setLocations(locations);
	//map.bindViewModel(vm);
	// initlaize the map
	map.init();
}



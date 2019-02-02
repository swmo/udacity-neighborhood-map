
/*
* the simple Model of an location
* added some getMethods to only read the values.
*/
var Location = function(id,name,description,address,position) {
	this.id = id;
	this.name = ko.observable(name);
	this.address = ko.observable(address);
	this.lat = ko.observable(position[0]);
	this.lng = ko.observable(position[1]);
	this.description = ko.observable(description);
	this.wikipediaArticles = ko.observableArray();

	this.getName = function(){
		return this.name();
	}

	this.getId = function(){
		return this.id;
	}

	this.getAddress = function(){
		return this.address();
	}

	this.getLat = function(){
		return this.lat();
	}

	this.getLng = function(){
		return this.lng();
	}

	this.getDescription = function(){
		return this.description();
	}


}
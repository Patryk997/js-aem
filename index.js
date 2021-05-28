
let some = {
    name: 'Mosh',
    age: 30,
    someArray: ['one','two'],

    draw :function()  {
        //console: console.log(this.name)
        //console.log(some['name']);

        //console.log(typeof(this.someArray));
        //console.log(this.someArray);
    }
}

some.draw();

function Circle(radius) {
    this.radius = radius;
    this.draw = function() {
        //console.log(radius);
    }
}

const anotherDraw = new Circle(1);
anotherDraw.draw();

//console.log(anotherDraw.constructor);

// utility script file for the real time container triggering and returning the response Object back to the client.

// Example :
// var NBAMServiceController = getNBAMServiceControl(hostName, port);
// NBAMServiceController.getOffers(customerID, containerName, channel, previous, current, responseCallback);	

// Call back response function which displays the offerList attributes on the UI.

// var responseCallback = function(response) { 		
//  if(typeof response.OffersList != "undefined") {
//  for (var i=0; i<response.OffersList.length; i++) 
// } }


var NBAMServiceController = getNBAMServiceControl("V3");
NBAMServiceController.getOffers("CON-1000", "TopOffers", "Web", "", "", null, "", "Hero,Tile,Tile,Tile");


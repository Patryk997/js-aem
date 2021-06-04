var imageUrl;

function getNBAMServiceControl(serviceClass,callMultiContainer) {


	var serverHostname = "ai401.pegalabs.io";
	var serverPort = "";
	var serviceClass = serviceClass;
	var callMultiContainer = callMultiContainer;
	var offerLength = 0;

    var imageUrlResponse;

	var NBAMServiceControl = {

        hostName : serverHostname,
        port : serverPort,
        serviceURLProtocol: 'https',
        url : "",

        initialize : function (serverHostname, serverPort) {

			this.hostName = serverHostname;
			this.port = serverPort;
			if (typeof this.hostName == 'undefined') this.hostName = "localhost";
			if (typeof this.port == 'undefined') this.port = "";
        if(this.hostName.startsWith('http://')) {
        this.serviceURLProtocol = "http";
      }
      var idx= this.hostName.lastIndexOf("/");
      if(idx!= -1) {
        this.hostName = this.hostName.substring(idx+1);
      }
			this.url = this.serviceURLProtocol + "://" + this.hostName + (this.port!="" ? ":" + this.port : "") + "/prweb/PRRestService/PegaMKTContainer/Services/ExecuteWebContainer?";

		},

		getServiceURL : function (serviceName,params) {
			var url;
			if (serviceClass) {
				url = this.serviceURLProtocol + "://" + this.hostName + (this.port!="" ? ":" + this.port : "") + "/prweb/PRRestService/PegaMKTContainer/" + serviceClass + "/" + serviceName + "?";

			} else {
				var url = this.serviceURLProtocol + "://" + this.hostName + (this.port!="" ? ":" + this.port : "") + "/prweb/PRRestService/PegaMKTContainer/Services/" + serviceName + "?";
			}

			if(params != null) {
			 url += params;
			}
			return url;

		},

		getStreamServiceURL: function(streamHost,streamPort,streamName) {
			var streamURL;
            if (typeof streamPort == 'undefined') streamPort = "";
			streamURL = this.serviceURLProtocol + "://" + streamHost + (streamPort!="" ? ":" + streamPort : "") +  "/stream/" + streamName;
			return streamURL;
		},

		getOffers : function (customerID, containerName, channel, previousPage, currentpage, callback,intent, placement) {
            

			this.checkCallBack(callback);
            
			var callbackFunction ;


			if(callMultiContainer){
				callbackFunction = function (data){
				    var responseData = data["ResponseData"];
					var containerNameList = containerName.split(",");
					for(var i=0;i<containerNameList.length;i++){
						console.log(responseData[containerNameList[i]]);
						callback(responseData[containerNameList[i]],containerNameList[i]);
					}
				};
			}
			else 
				callbackFunction = callback;
            
			var jsonObj = this.getJSONObj(customerID, containerName, channel, previousPage, currentpage,intent, placement);
            
			if(serviceClass){
				this.invokeRemoteService("Container",null,"POST",jsonObj,callbackFunction);
			} else {
				this.invokeRemoteService("ExecuteWebContainer",null,"POST",jsonObj,callbackFunction);
			}

            return jsonObj;

		},

		getJSONObj : function(customerID, containerName, channel, previousPage, currentpage, intent, placement){
			if(serviceClass){
				var jsonObj = {
					"SubjectID" : customerID,
					"ContainerName" : containerName,
                    "ContextName":"Customer",
					"Channel": channel,
					"Direction": "Inbound",
                    "Placements":placement,
                  	"Contexts": [{
                                  "Key": "CurrentPage",
                                  "Value": currentpage,
                                  "Type": "CurrentPage"
                             	 },
                                 {
                                  "Key": "PreviousPage",
                                  "Value": previousPage,
                                  "Type": "PreviousPage"
                             	 }]

				};
        if(intent && intent!=="") {
          jsonObj.Contexts.push({
                                  "Key": "CurrentPage",
                                  "Value": intent,
                                  "Type": "Intent"
                             	 });
        }
			} else {
				var jsonObj = {
					"CustomerID" : customerID,
					"ContainerName" : containerName,
					"Channel": channel,
					"PreviousPage":previousPage,
					"CurrentPage":currentpage
			    };
			}
			return jsonObj;
		},


		/* "captureSingleWebImpression " : to capture single web impression, pass following parameters and the impresssion would be captured.*/
		captureSingleWebImpression : function (ContainerID, CustomerID, OfferID, Issue, Group, InteractionID, campaignID,callback) {
			var jsonObj = {
				"CustomerID" : CustomerID,
				"ContainerName" : ContainerID,
				"OffersList" : [{
						"OfferID" : OfferID,
						"Issue" : Issue,
						"Group" : Group,
						"InteractionID" : InteractionID,
						"CampaignID": campaignID
					}
				]
			};

			this.captureMultipleWebImpression(jsonObj, callback);
		},

		/**
		* "captureMultipleWebImpression" :
		* Accepts the JSON Object with the list of offers and then captures the impressions for all the offers
		**/
		captureMultipleWebImpression : function (JSONObj, callback) {
			var jsonString = JSON.stringify(JSONObj);
			var serviceUrl = this.getServiceURL("CaptureWebImpression",null);
			var xmlHttpReq = this.createRequest('POST', serviceUrl, callback);
			if (xmlHttpReq)	xmlHttpReq.send(jsonString);
		},

      	/**
		*"capturePaidClickResponse " : capture paid meida click response
		**/
		capturePaidClickResponse : function (CustomerID, ExternalAudienceId, PaidAccountId, ReferrerUrl, Source, Utm_medium, callback) {
			var jsonObj = {
				"CustomerID" : CustomerID,
				"ExternalAudienceId" : ExternalAudienceId,
				"PaidAccountId" : PaidAccountId,
				"ReferrerUrl" : ReferrerUrl,
				"Source" : Source,
				"Utm_medium" : Utm_medium
			};

			this.captureMultiplePaidClickResponse(jsonObj, callback);
		},

		/**
		* "captureMultiplePaidClickResponse" capture paid meida click response
		**/
		captureMultiplePaidClickResponse : function (JSONObj, callback) {
			var jsonString = JSON.stringify(JSONObj);
			var serviceUrl = this.getServiceURL("CapturePaidResponse",null);
			var xmlHttpReq = this.createRequest('POST', serviceUrl, callback);
			if (xmlHttpReq)	xmlHttpReq.send(jsonString);
		},
		// Create the XHR object.
	 createRequest : function(method, url, callback) {
		var xhr = new XMLHttpRequest();
		if (typeof xhr == "undefined") { return null; }

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {


				var data = xhr.responseText;
                //var dataJSON = JSON.parse(data);

                console.log("This is data: " + data);


				if (data && typeof callback == "function") {
					try {
						callback(JSON.parse(data));     
					} catch (exception) {}
				}
			}
		};
		xhr.onerror = function () {
			//do nothing;
		};
		xhr.open(method, url, true);
		return xhr;
	},

	checkCallBack : function(callback) {

		if (callback == null  || typeof callback == 'undefined') {
			callback = this.callDefaultCallBack;
		}
	},

	callDefaultCallBack : function (response) {

		var OffersList;
	 	if(typeof response.OffersList != "undefined") {
			OffersList = response.OffersList;
		} else if(data.RankedResults && data.RankedResults.length) {
			OffersList = response.RankedResults;
		}


		for (var i=0; i< OffersList.length; i++) {
		      //Get the src for the img tag...
		      var ba = document.getElementById("BannerAd" + (offerLength+i));
		      var tagname = "BannerURL";
		      if (ba && $(ba).hasClass("smimg")) {
		         tagname = "BannerURLSmall";
		      }

			  offerLength = offerLength+i;

		      var bannerURL = OffersList[i].ImageURL;
		      if (ba) ba.src = bannerURL;

		      //Get the href for the anchor/link tag
		      var bannerRef = OffersList[i].ClickThroughURL;


		      var bc = document.getElementById("BannerClick" + i);
		      if (bc) bc.href = bannerRef;
	   	}
	},

	/* captureWebResponse function is implemented as part US-81885 */

	captureWebResponse : function (containerID, customerID, offerID, issue, group, interactionID,outcome,behaviour,channel,direction,campaignID,callback) {

		var jsonObj = {
			"CustomerID" : customerID,
			"ContainerName" : containerID,
			"OffersList" : [{
					"OfferID" : offerID,
					"Issue" : issue,
					"Group" : group,
					"CampaignID": campaignID,
					"InteractionID" : interactionID,
					"Outcome":outcome,
					"Behaviour":behaviour,
					"Direction":direction,
					"Channel":channel

				}]
		};
		this.captureWebResponseWithJSON(jsonObj,callback);

	},
	captureWebResponseWithJSON : function(jsonObj,callback){
		this.invokeRemoteService("CaptureWebResponse",null,"POST",jsonObj,callback);
    },
	captureResponse : function(containerID, customerID, offerID, issue, group, interactionID,outcome,behaviour,channel,direction,campaignID,callback,initiateOffer){


		if(serviceClass){
			var jsonObj = {
				"CustomerID" : customerID,
				"ContainerName" : containerID,
				"RankedResults" : [{
						"Name" : offerID,
						"Issue" : issue,
						"Group" : group,
						"CampaignID": campaignID,
						"InteractionID" : interactionID,
						"Outcome":outcome,
						"Behaviour":behaviour,
						"Direction":direction,
						"Channel":channel

				}]
			};
		} else {
			var jsonObj = {
				"CustomerID" : customerID,
				"ContainerName" : containerID,
				"OffersList" : [{
						"OfferID" : offerID,
						"Issue" : issue,
						"Group" : group,
						"CampaignID": campaignID,
						"InteractionID" : interactionID,
						"Outcome":outcome,
						"Behaviour":behaviour,
						"Direction":direction,
						"Channel":channel

				}]
			};
		}

		this.captureResponseWithJSON(jsonObj,callback,initiateOffer);
	},
	captureResponseWithJSON : function(jsonObj,callback,initiateOffer){
		if(serviceClass){
			if(initiateOffer){
				this.invokeRemoteService("CaptureResponse/Initiate",null,"POST",jsonObj,callback);
			} else {
				this.invokeRemoteService("CaptureResponse",null,"POST",jsonObj,callback);
			}
		} else{
			this.invokeRemoteService("CaptureResponse",null,"POST",jsonObj,callback);
		}

    },

	invokeRemoteService: function(serviceName,urlParams,httpVerb,jsonObj,callback){
		var serviceUrl = this.getServiceURL(serviceName,urlParams);
		var xmlHttpReq = this.createRequest(httpVerb, serviceUrl, callback);

        console.log(JSON.stringify(jsonObj));

		if (xmlHttpReq)	xmlHttpReq.send(JSON.stringify(jsonObj));
	},

        //replaceImageOfferUrl: function() {

      //   $('#img-id').attr('src', url);
     //    //console.log("im about to replace imageUrl");

   //   },


     getResponseDataConverted: function(responseData) { 



         this.imageUrlResponse = responseData.ContainerList[0].RankedResults[0].ImageURL;
         var containerOffers = responseData.ContainerList[0].RankedResults;


         //console.log("function: " + containerOffers.length);

         //this.replaceImageOfferUrl(this.imageUrlResponse);
		 //$('.img-id').attr('src', this.imageUrlResponse);


         var slideIndex = 0;


         	function displaySlides() {

                var i;
                var allImages   = document.getElementsByClassName("img-1");
                var allHeaders2 = document.getElementsByClassName("h2-1");
                var allTitles   = document.getElementsByClassName("title");
                //var allBoxes = document.getElementsByClassName("slidebox");

                //for (i=0; i < allSlides.length; i++) {allSlides[i].style.display = "none";}
    
                for (i=0; i < containerOffers.length; i++) {

                        //allSlides[i].style.display = "none";
                        allImages[i].src 		 = containerOffers[i].ImageURL;
                    	allHeaders2[i].innerHTML = containerOffers[i].Label;
                    	allTitles[i].innerHTML 	 = containerOffers[i].Issue;
    
                        //console.log("this is i: " + i);
    
                }

            
            }

            displaySlides();
        
      },





   sendRTSEvent : function(customerID, eventName, callback) {
     console.log("Sending RTS Event ID: " + customerID + " Event: " + eventName);
     customerID = encodeURI(customerID);
     this.invokeRemoteService("DigitalActivityStream?ID="+customerID+"&Intent="+eventName,null,"GET",null,callback);
    },

  };


    return NBAMServiceControl;
}
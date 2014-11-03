//console.log("adinject.js");

// pass 'msg' function into page-scope for advault.js
exportFunction(function(m) {  self.port.emit(m);  }, unsafeWindow, { defineAs: "msg"} )
	
self.port.on('refresh-ads', function(data) {
	
	// pass 'ads' object into page-scope for advault.html
	unsafeWindow.options = cloneInto( { "ads" : data.ads }, unsafeWindow);
});

self.port.on("ad-updated", function(update) {
	
	console.log("INJECTOR: ad-updated: "+typeof computeStats +" " +typeof updateVisitedAds);

	var theAds = unsafeWindow.options.ads;
	
	// Update the ad in window.ads
	var found = findAdById(update.id, theAds, true);
	
	//console.log("Visited(pre): "+found.visited);
	found[update.field] = update.value;
	//console.log("Visited(post): "+findAdById(update.id, unsafeWindow.options.ads, true).visited);
	
	updateVisitedAds(theAds);

	// Now recompute the stats
	computeStats(theAds);
});

function findAdById(id, ads) {
	
	for (i=0, j=ads.length; i< j; i++) {
		
		if (ads[i].id === id)
			return ads[i]
	}
	
	return null;
}
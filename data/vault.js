//inspectorData, inspectorIdx, animatorId, resizing = false, , animateMs = 2000, container, pack;
var itemClicked = false, zoomStyle, zoomIdx = 0;
    zooms = [ 100, 50, 25, 12.5, 6.25 ];

self.port && self.port.on('layout-ads', layoutAds); // refresh all
self.port && self.port.on('update-ads', updateAds); // update some

function computeStats(ads) {

    $('.since').text(formatDate(sinceTime(ads)));
    $('.clicked').text(numVisited(ads) + ' ads clicked');
    $('.detected').text(ads.length + ' detected.');
}

function layoutAds(addonData) { 
   
	var ads = processAdData(addonData.data).ads,
        currentAd = addonData.currentAd;

	//log('Vault.layoutAds: '+ads.length);

	all = ads.slice(); // save original set

	addInterfaceHandlers();

    createSlider(ads);

	doLayout(ads, true);
	
    currentAd && tagCurrentAd(currentAd);
}

// CHANGED(12/19): Each ad is now visited separately
function updateAds(addonData) {

    var ads = processAdData(addonData.data).ads, 
        vdate, update = addonData.update,
        currentAd = addonData.currentAd,
        //inspectorId = addonData.inspectorDataId; // remove?
             
	//log('Vault.updateAds(): inspectorId='+inspectorId);
	
	all = ads.slice(); // save original set

	// update class/title/visited/resolved-url
    //updates.map(doUpdate);
    doUpdate(update);

    /*if (inspectorId) { // TODO: need this still?
        
        inspectorData = null;
        
        var $item = $("#ad"+inspectorId);
        var insp = createInspectorObj($item);
        
    }*/

    currentAd && tagCurrentAd(currentAd);

	computeStats(ads);
}

function doUpdate(updated) {

    //console.log('doUpdate: #'+updated.id);

    var sel = '#ad' + updated.id, newClass;

    // update the title
    $(sel).attr('data-title', updated.title);

    // update the visit-time
    var vdate = formatDate(updated.visitedTs);
    $(sel).attr('data-visitedTs', vdate);

    // update the target-url
    if (updated.resolvedTargetUrl) {

        //log(sel+": resolvedTargetUrl="+updated.resolvedTargetUrl);
        $(sel).attr('data-targetUrl', updated.resolvedTargetUrl);
    }

    // update the class (now visited)
    newClass = (updated.visitedTs > 0) ? 'visited' : 'failed';
    $(sel).removeClass('pending').addClass(newClass);
    $(sel).removeClass('just-visited').addClass('just-visited');

    // Update inspector fields with (title,visitedTs,targetUrl)
    //if ($(sel).hasClass('inspectee'))
        //updateInspector(updated, vdate);
}

function doLayout(theAds, resetLayout) {

//console.log('Vault.doLayout: '+theAds.length);

    if (!theAds) throw Error("No ads!");

    var result = formatDivs(theAds);

    $('#container').html(result);

    computeStats(theAds);

    enableLightbox();

    repack(theAds, resetLayout);
    //dbugOffsets && addTestDivs();
}

function repack(theAds, resetLayout) {

	var visible =  $(".item").length;
	
	log("Vault.repack() :: "+visible);

    showAlert(visible ? false : 'no ads found');

	if (visible > 1) { // count non-hidden ads

		setTimeout(function() {

			new Packery(
				'#container', {
					centered : { y : 5000 }, // centered half min-height
					itemSelector : '.item',
					gutter : 1
			});

			if (resetLayout) positionAds();

		}, 300);
	}
	else if (visible === 1) {

		// center single ad here (no pack)
		var sz = realSize( $('.item img') );

        console.log("SINGLE PACK: ", sz);// $('#right').width());
        
        if (!sz.w) console.warn("No width for image! "+sz.w);
		
		$(".item").css({ top: '5000px' , left: (5000 - sz.w/2)+'px' } ); // sz.w/2
	}
}

function formatDivs(ads) { // TODO: this is rather hideous

	log('formatDivs: '+ads.length);

	var ad, textAds = 0, html = '';

	for (var i=0, j = ads.length; i<j; i++) {

        ad = ads[i];

		if (ad.contentType === 'text') {

			textAds++;
			
            html += '<div id="ad'+ad.id+'" class="item-text item';
            //html += '<a data-href="'+ad.targetUrl+'" id="ad'+ad.id+'" class="item';

            html += ad.hidden ? '-hidden ' : ' '; // hidden via css

            if (ad.visitedTs == 0) html += 'pending ';
            if (ad.visitedTs  < 0) html += 'failed ';
            if (ad.visitedTs  > 0) html += 'visited ';
   
            // TODO: replace with a binding from DOM-element to object
            // http://stackoverflow.com/questions/16483560/how-to-implement-dom-data-binding-in-javascript
            html += 'dup-count-'+ad.count+'" ';
            html += 'data-id="'+ad.id+'" ';
            html += 'data-title="'+ad.title+'" ';
            html += 'data-type="'+ad.contentType+'" ';
            html += 'data-foundTs="'+formatDate(ad.foundTs)+'" ';
            html += 'data-visitedTs="'+formatDate(ad.visitedTs)+'" ';
            html += 'data-targetUrl="'+ad.targetUrl+'" ';
            html += 'data-contentData="'+ad.contentData.text+'/'+ad.contentData.site+'" ';
            html += 'data-pageUrl="'+ad.pageUrl+'">';

            if (!ad.hidden)
            {
                html += '<span class="counter">'+ad.count+'</span>';
                //html += '<span class="eye" data-href="'+ad.page+'">go to origin link</span>';
                html += '<span class="thumb">Text Ad</span><h3><a target="new" class="title" href="'
                html += ad.targetUrl + '">' + ad.title + '</a></h3><cite>' + ad.contentData.site;
                html += '</cite><div class="ads-creative">' + ad.contentData.text +'</div>\n';
            }

            html += '</div>\n';
		}
		else // assume: contentType === 'img'
		{
			html += '<div id="ad'+ad.id+'" class="item';
			//html += '<a data-href="'+ad.targetUrl+'" id="ad'+ad.id+'" class="item';

			html += ad.hidden ? '-hidden ' : ' '; // hidden via css

			if (ad.visitedTs == 0) html += 'pending ';
			if (ad.visitedTs  < 0) html += 'failed ';
			if (ad.visitedTs  > 0) html += 'visited ';

			var imgSrc = (ad.contentData.src || ad.contentData); // bc
			
			// TODO: replace with a binding from DOM-element to object
			// http://stackoverflow.com/questions/16483560/how-to-implement-dom-data-binding-in-javascript
			html += 'dup-count-'+ad.count+'" ';
			html += 'data-id="'+ad.id+'" ';
			html += 'data-title="'+ad.title+'" ';
			html += 'data-type="'+ad.contentType+'" ';
			html += 'data-foundTs="'+formatDate(ad.foundTs)+'" ';
			html += 'data-visitedTs="'+formatDate(ad.visitedTs)+'" ';
			html += 'data-targetUrl="'+ad.targetUrl+'" ';
			html += 'data-contentData="'+ imgSrc+'" ';
			html += 'data-pageUrl="'+ad.pageUrl+'">';

			if (!ad.hidden)
			{
				html += '<span class="counter">'+ad.count+'</span>';
				//html += '<span class="eye" data-href="'+ad.page+'">go to origin link</span>';
				html += '<img id="img'+ad.id+'" src="' + imgSrc + '" alt=""';
				html += ' onError="this.onerror=null; this.src=\'img/blank.png\';">';
			}

			html += '</div>\n';
		}

	}

	//log("Found "+textAds + ' text-ads');

	return html;
}

function numVisited(ads) {

	var numv = 0;
	for (var i=0, j = ads.length; i<j; i++) {

		if (ads[i].visitedTs > 0) {
		    //console.log('Found visited: #'+ads[i].id);
			numv++;
        }
	}
	return numv;
}

function sinceTime(ads) {

	var oldest = +new Date(), idx = 0;
	for (var i=0, j = ads.length; i<j; i++) {

		if (ads[i].foundTs < oldest) {
			oldest = ads[i].foundTs;
			idx = i;
		}
	}
	return oldest;
}

function dragStart(e) {

    var style = window.getComputedStyle(document.querySelector('#container'), null);
	   x = parseInt(style.getPropertyValue("margin-left"), 10) - e.clientX,
	   y = parseInt(style.getPropertyValue("margin-top"),  10) - e.clientY;

    e.dataTransfer.setData("text/plain", x + ',' + y);   
}

/*function handleDragStart(e) {
	this.style.opacity = '0.4';  // this / e.target is the source node.
}*/

//function dragOver(e) {	return _drag(e); }

//function drop(e) { return _drag(e); }

function drag(e) {
    
	var offset = e.dataTransfer.getData("text/plain").split(','),
        dm  = document.querySelector('#container');

    dm.style.marginLeft = (e.clientX + parseInt(offset[0], 10)) + 'px';
    dm.style.marginTop = (e.clientY + parseInt(offset[1], 10)) + 'px';

	//dbugOffsets && updateTestDivs();

    e.preventDefault();
}

function formatDate(ts) {

	if (!ts) return 'pending';

	if (ts < 0)  return 'Unable to Visit';

	var date = new Date(ts), days = ["Sunday", "Monday",
		"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var months = ["January", "February", "March", "April", "May",
		"June", "July", "August", "September", "October",
		"November", "December"];

	var pad = function(str) {

		str = String(str);
		return (str.length < 2) ? "0" + str : str;
	}

	var meridian = (parseInt(date.getHours() / 12) == 1) ? 'PM' : 'AM';
	var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();

	return days[date.getDay()] + ' ' + months[date.getMonth()] + ' ' + date.getDate()
		+ ' ' + date.getFullYear() + ' ' + hours + ':' + pad(date.getMinutes())
		+ meridian.toLowerCase();
}

// TODO: This should only reset the x-axis/scale, not recreate everything
function resizeHistorySlider() {

	createSlider(all); // is this ok, or need a copy?
}

function enableLightbox() {

	$('.item').mouseenter(function() {

	    // populate the inspector & animate if dups
        if (!$('#container').hasClass('lightbox-view')) 
        {
	       //setInspectorFields(this);
        }
    });
    
    $('.item').click(function(e) { 
        
        e.preventDefault();
        
        //setInspectorFields(this);
        
        $(this).addClass('lightbox-selected')
            .siblings().removeClass('lightbox-selected');

        /*var $item = $(this);
        var pos = $item.position();
        $item.data('orig-x', pos.left);
        $item.data('orig-y', pos.top);
        //console.log(centerX-pos.left,centerY-pos.top);
        $item.transition({
            x : 5000 - pos.left,
            y : 5000 - pos.top
        });
        */        
        $('#container').toggleClass('lightbox-view');
        
        //console.log( 'lightbox: '+$('#container').hasClass('lightbox-view') ); 
        
        itemClicked = true; 
    });

	$('.item').mouseleave(function() {
	    
	    //console.log("mouseleave ***");
        if (!$('#container').hasClass('lightbox-view')) 
        {
		  // kill any remaining dup animations
		  //stopInspectorAnimations();
        }
	});
}

function stopInspectorAnimations() {

    animatorId && clearTimeout(animatorId);
}

function setInspectorFields(ele) {

//console.log("setInspectorFields(): "+$(ele).attr('id')+" has="+$(ele).hasClass('inspectee'));

    // don't reset animatation of the same ad
    if (!$(ele).hasClass('inspectee')) {

        // remember this as last in the inspector
        $(ele).addClass('inspectee').siblings()
            .removeClass('inspectee');

//console.log("pre-notify: "+$(ele).attr('id'));

        // load primary ad & all dups for inspector
        inspectorData = loadInspectorData(ele);

        notifyAddon(inspectorData[0].id);

        // fill fields for first empty pane & set class to 'full'
        populateInspector(inspectorData, inspectorIdx=0);

        // make/layout controls for duplicates
        makeDuplicateControls(inspectorData);

//console.log('doAnimation1 *********');
        doAnimation(inspectorData);
    }

//console.log("setInspectorFields(): "+inspectorData.length);

    if (inspectorData.length > 1)  // but cycle either way
         cycleThroughDuplicates();
}

function notifyAddon(adId) {
    
    //console.log("Vault.notify:"+adId);
    //if ( typeof notifyTimer == 'undefined')
      //  var notifyTimer = 0;
        
    //clearTimeout(notifyTimer);
    
    //notifyTimer = setTimeout(function() {

    self.port && self.port.emit("update-inspector", { "id": adId } );
        
    //}, 200); // not sure if we need this delay
}

function loadInspectorData(ele) {

	var data = [ createInspectorObj(ele) ];
	return findDuplicates(data); // returns data
}

function createInspectorObj(item) {
    
    $item = $(item);
    $img = $('img', item);
    
//console.log('createInspectorObj: ad#'+$item.attr('data-id')+"/"+$item.attr('data-title'));

	return {

        id: $item.attr('data-id'),
		imgsrc : $img.attr('src'),
		imgalt : $img.attr('alt'),
		title: $item.attr('data-title'),
		target : $item.attr('data-targetUrl'),
		origin : $item.attr('data-pageUrl'),
		visited : $item.attr('data-visitedTs'),
		detected : $item.attr('data-foundTs'),
		content: $item.attr('data-contentData')
	}
}

function findDuplicates(insDataArr) { // contains template at index=0

	$(".item-hidden").each(function(i) {

		var next, url = $(this).attr('data-contentData');
				
		if (url === insDataArr[0].content) { // same ad-image?

		    //if (url === insDataArr[0].imgsrc) { // same ad-image?

			next = createInspectorObj(this);
			insDataArr.push(next);
		}
	});

	return insDataArr;
}

function makeDuplicateControls(data) {

	// reset the controls (small dots below img)
	$(".controls" ).empty();

	for (var i=0; i < data.length; i++) {

		var li = '<li data-idx="'+i+'" class=';
		li += (i == 0)  ? 'active' : 'passive';
		$('.controls').append(li+'><a href="#"'+
			 ' class="btn circle"></a></li>');
	}
}

function populateInspectorDetails(ele, insp) {

    $ele = $(ele);
    
    // update image-src and image-alt tags
    $ele.find('img')
        .attr('src', insp.imgsrc)
        .attr('alt',  insp.imgalt);

    // update inspector fields
    $ele.find('.title').text(insp.title);
    $ele.find('.target').text(insp.target);
    $ele.find('.origin').text(insp.origin);
    $ele.find('.visited').text(insp.visited);
    $ele.find('.detected').text(insp.detected);
}

function attachTests() {

	$.getJSON(TEST_ADS, function(jsonObj) {

		console.warn("Vault.js :: Loading test-ads: "+TEST_ADS);
	    layoutAds({ data : jsonObj, page : TEST_PAGE });

	}).fail(function(e) { console.warn( "error:", e); });
}

function realSize(theImage) { // use cache?

	// Create new offscreen image
	var theCopy = new Image();
	theCopy.src = theImage.attr("src");

	// Get accurate measurements from it
	return { w: theCopy.width, h: theCopy.height };
}

function zoomIn() {

	(zoomIdx > 0) && setZoom(--zoomIdx);
}

function zoomOut() {

	(zoomIdx < zooms.length-1) && setZoom(++zoomIdx);
}

function setZoom(idx) {

	$('#container').removeClass(zoomStyle).addClass // swap zoom class
		((zoomStyle = ('z-'+zooms[idx]).replace(/\./, '_')));

	$('#ratio').html(zooms[idx]+'%');

	//dbugOffsets && updateTestDivs();
}


function positionAds() { // autozoom & center

	//log("Vault.positionAds");

	var percentVisible = .6,
		winW = $("#left").width(),
		winH = $('#svgcon').offset().top, 
		i, x, y, w, h, minX, maxX, minY, maxY, problem;

    //log('winW: '+winW+' winH: '+winH);
    
	for (i=0; i < zooms.length; i++) {

		problem = false; // no problem at start

		// loop over each image, checking that they (enough) onscreen
		$('.item img').each(function(i, img) {

            $img = $(this);
			x = $img.offset().left,
			y = $img.offset().top,
			scale = zooms[zoomIdx] / 100,
			sz = realSize($img),      // original size
			w = sz.w * scale,        // scaled width
			h = sz.h * scale,        // scaled height
			minX = (-w * (1 - percentVisible)),
			maxX = (winW - (w * percentVisible)),
			minY = (-h * (1 - percentVisible)),
			maxY = (winH - (h * percentVisible));

			//log(i+")",x,y,w,h);
			// COMPARE-TO (console): $('.item img').each(function(i, img) { log( i+") "+Math.round($(this).offset().left)) });

			if (x < minX || x > maxX || y < minY || y > maxY) {

				zoomOut();
				//log('Ad('+$img.attr('id')+') offscreen, zoom='+zoomStyle);
				return (problem = true); // break jquery each() loop
			}
		});

		if (!problem) return;	// all ads ok, we're done
	}
}


function findAdById(id, ads) {

    for (i=0, j=ads.length; i< j; i++) {

        if (ads[i].id === id)
            return ads[i]
    }

    return null;
}

function openInNewTab(url) {
    
  var win = window.open(url, '_blank');
  win.focus();
}

function addInterfaceHandlers(ads) {

    //console.log('addInterfaceHandlers');

	/////////// RESIZE-PANELS

	/*$('#handle').mousedown(function(e){

        e.preventDefault();
	    resizing = true;
	});*/
	
    $('#x-close-button').click(function(e) {
        
        self.port && self.port.emit("close-vault");
    });
    
    $('#logo').click(function(e) {
        
        openInNewTab('http://dhowe.github.io/AdNauseam/');
    });

	// $(document).mouseup(function(e) {
        // e.preventDefault();
    	// ///resizing = false;
	// });
	
    $(document).click(function(e) {
        e.preventDefault();
        (!itemClicked) && $('#container').removeClass('lightbox-view');
        itemClicked = false;
    });


	/////////// DRAG-STAGE

	document.querySelector('#container').addEventListener('dragstart', dragStart, false);
	document.body.addEventListener('dragover', drag, false);
	document.body.addEventListener('drop', drag, false);
	  // from: http://jsfiddle.net/robertc/kKuqH/

	/*$(document).mousemove(function(e) {

	    if (resizing) {  // constrain drag width here

	    	var w = $('body').width(),
	    		lw = e.pageX = Math.min(Math.max(w*.3, e.pageX), w*.9);

	      	$('#left').width(lw);
	        $('#right').width(w - e.pageX);

	        resizeHistorySlider();
	    }

	    e.preventDefault();
	});*/


	/////////// ZOOM-STAGE


	// click zoom-in
	$('#z-in').click(function(e) {

		zoomIn();
		e.preventDefault();
	});

	// click zoom-out
	$('#z-out').click(function(e) {

		zoomOut();
		e.preventDefault();
	});

    $(window).resize(resizeHistorySlider);

    /*$(window).resize(function() {

        if ( typeof resizeTimer == 'undefined')
            var resizeTimer = 0;

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function() {

            $('#left').width(''); // hack so that a panel-drag doesnt
            $('#right').width(''); //  break window-resizing

            resizeHistorySlider();

        }, 500); // not sure if we need this delay
    });*/
}
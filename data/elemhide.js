
var textAdSelectors = [ 
    { selector: '#tads.c', waitfor: ".ads-ad", handler: googleText, name: 'adsense' },  // top side AD
    { selector: '#rhs_block > #mbEnd', waitfor: ".ads-ad", handler: googleText, name: 'adsense' },  // right side AD
    { selector: '#bottomads', waitfor: ".ads-ad", handler: googleText, name: 'adsense' },   // bottom side AD
    { selector: '.results--ads', waitfor: '.sponsored', handler: duckDuckText, name: 'duckduckgo' },
    { selector: '.ads', waitfor: 'li', handler: yahooText, name: 'yahoo' },
    { selector: '.b_ad', waitfor: '.sb_adTA', handler: bingText, name: 'bing' },
    { selector: '#rtm_html_441', waitfor: 'tr:nth-child(even)', handler: ebayText, name: 'ebay' },

    { selector: '#content_right > table > tbody > tr > td > div:not(#con-ar)', 
        waitfor: "div[id^='bdfs']", handler: baiduText, name: 'baidu' },
    { selector: '#right > .atTrunk:last-child', waitfor: '.b_rb', handler: sogouText, name: 'sogou' },
    { selector: '.sponsored', waitfor: 'li', handler: sogouTopAndBottomText, name: 'sogou' },
];

$(function() { // page-is-ready
    
    var $hidden = $("*").filter(function() {

        return /^url\("about:abp-elemhidehit?/.test($(this).css("-moz-binding"));
    });
    
    //console.log("HIDDEN: " + $hidden.length);

    $hidden.each(function() {
    
        for (var i=0; i < textAdSelectors.length; i++) {
   
            var data = textAdSelectors[i];
                waitSel = data.selector + ' ' + data.waitfor;

            if ( $(this).is(data.selector)) {
                
                 console.log('HIT: ' + waitSel);
                 
                 waitForKeyElements(waitSel, data.handler);
            }
        }
    });
});

function ebayText(anchor) {

    // console.log('ebayText(): ', anchor.text());
    var title = anchor.find('a > div:first-child');
    // console.log('title: ', title.text());
    var site = anchor.find('a > div:nth-child(2)');
    // console.log('site: ', site.text());
    var text = anchor.find('a > div:nth-child(3)')
    // console.log('text: ', text.text());
    var targetUrl = anchor.find('a');
    // console.log("targetUrl.attr('href'): ", targetUrl.attr('href'));

    if (text.length && site.length && title.length) {
 
        var ad = createAd('ebay', title.text(), 
            text.text(), site.text(), targetUrl.attr('href'));  
            
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('ebayText.fail: ', text, site);
    }
}

function sogouText(anchor) {

    var title = anchor.find('h3 a');
    var site = anchor.find('div:nth-child(2) a');
    var text = anchor.find('div:last-child a');

    if (text.length && site.length && title.length) {
 
        var ad = createAd('sogou', title.text(), 
            text.text(), site.text(), title.attr('href'));  
            
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('sogouText.fail: ', text, site);
    }
}

function sogouTopAndBottomText(anchor) {

    // console.log('sogouTopAndBottomText(): ', anchor.text());

    var title = anchor.find('h3 > a');
    // console.log('title: ', title.text());
    var site = anchor.find('h3 > cite');
    // console.log('site: ', site.text());
    var text = anchor.text();
    text = text.replace(title.text(), "").replace(site.text(), "").replace("  ", "");
    // console.log('text: ', text);

    if (text.length && site.length && title.length) {
 
        var ad = createAd('sogou', title.text(), 
            text, site.text(), title.attr('href'));  
            
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('sogouTopAndBottomText.fail: ', text, site);
    }
}

function baiduText(anchor) {
    
    var title = anchor.find("a:first-child");
    var text = anchor.find("font:first-child");
    var site = anchor.find("font:last-child");

    if (text.length && site.length && title.length) {
 
        var ad = createAd('bing', title.text(), 
            text.text(), site.text(), title.attr('href'));  
            
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('baiduText.fail: ', text, site);
    }
}

function bingText(anchor) {
    
    var title = anchor.find("h2 a");
    var text = anchor.find("div.b_caption p");
    var site = anchor.find("div.b_attribution cite");

    if (text.length && site.length && title.length) {
 
        var ad = createAd('bing', title.text(), 
            text.text(), site.text(), title.attr('href'));  
            
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('bingText.fail: ', text, site);
    }
}

function yahooText(anchor) {
    
    //console.log("HIT *** anchor: "+anchor[0].classList);

    var title = anchor.find('div:first-child a');
    var text = anchor.find('div.abs a');
    var site = anchor.find('em a');
    // console.log("    *** targetUrl: "+title.attr('href'));
    
    if (text.length && site.length && title.length) {
 
        var ad = createAd('yahoo', title.text(), 
            text.text(), site.text(), title.attr('href'));  
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('yahooText.fail: ', text, site);
    }
}
    
function googleText(anchor) {
    
    var title = anchor.find('h3 a');
    var text = anchor.find('.ads-creative');
    var site = anchor.find('.ads-visurl cite');
    
    if (text.length && site.length && title.length) {
 
        var ad = createAd('google', title.text(), 
            text.text(), site.text(), title.attr('href'));  
        self.port && self.port.emit('parsed-text-ad', ad);
    }
    else {
        
        console.warn('googleText.fail: ', text, site);
    }
}

function duckDuckText(anchor) {
                    
    var title = anchor.find('.result__a')
    var text = anchor.find('.result__snippet a');
    var site = anchor.find('a.result__url');
    
    // console.log("  *** title: "+title.text());
    // console.log("    *** text: "+text.text());
    // console.log("    *** site: "+site.text());
    // console.log("    *** targetUrl: "+anchor.attr('href'));
      
    if (text.length && site.length && title.length) {
        
        var ad = createAd('duckduckgo', title.text(), 
            text.text(), site.text(), title.attr('href'));  
        self.port && self.port.emit('parsed-text-ad', ad);
    } 
    else {
        
        console.warn('duckDuckText.fail: ',  text, site);
    }
}

function createAd(network,title,text,site,target) {
    
    return  {
        network : network,            
        pageUrl : document.URL,
        title : title,
        text : text,
        site : site,
        targetUrl : target
    };
}
    

/*  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements(
            "div.comments", 
            commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction(jNode) {
            jNode.text("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
// from: https://gist.github.com/BrockA/2625891
function waitForKeyElements(
    
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
      
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*  Found target node(s). Go through each and act if they are new. */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}

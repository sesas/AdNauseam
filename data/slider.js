$(document).ready(historySlider);

var format = d3.time.format("%a %b %d %Y");

function historySlider() {

	var data = sortAdsPerDay(ads);		
	
	var margin = {top: 0, right: 130, bottom: 0, left: 20},
	    width =  parseInt(d3.select("#left").style("width"), 10) - margin.left - margin.right,
	    height = 50 - margin.top - margin.bottom;

  	var amountFn = function(d) { return d.count },
  		dateFn = function(d) { return format.parse(d.date) }
  	
  	var x = d3.time.scale()
   		.range([0, width])
    	.domain(d3.extent(data, dateFn));

  	var y = d3.scale.linear()
    	.range([10, height-20])
    	.domain(d3.extent(data, amountFn));
    	
	var brush = d3.svg.brush()
	    .x(x).extent([x.invert(width/2-50), x.invert(width/2+50)])
	    .on("brushstart", brushstart)
	    .on("brush", brushmove)
	    .on("brushend", brushend);

	var arc = d3.svg.arc()
	    .outerRadius(height / 2)
	    .startAngle(0)
	    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

	var svg = d3.select("#stats").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.svg.axis().scale(x).orient("bottom"));
	    
	// var rect = svg.append("g")
		// .attr("class", "bars")
		// .selectAll("rect")
	    // .data(data)
	    
	// a single div to hold tooltip info for rects
	var div = d3.select("body").append("div")   
    	.attr("class", "tooltip")               
    	.style("opacity", 1);
        
	var rect = svg.append("g")
		.attr("class", "bars")
		.selectAll("rect")
	    .data(data)
	  	.enter().append("rect")
	  	.on("mouseover", function(d) {     
	  		
			div.transition()        
	    		.duration(200)      
	    		.style("opacity", .9);      
			
			div.html(d.date+"<br/>"+d.count+" Ad(s) found")  
	    		.style("left", (d3.event.pageX) + "px")     
	    		.style("top", (d3.event.pageY - 28) + "px");    
		})                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
	  	.attr({
		  width: 5,
		  height: function(d) { return y(amountFn(d)) },
		  x: function(d) { return x( dateFn(d) ) },
		  y: 10
	});
	
	// .attr("x", function(d) { return x(d) })
	// .attr("y", function(d) { return y(d) })
	// .attr("width", 2)
	// .attr("height", function(d) { return height - y(d) })

	/*var brushg = svg.append("g")
	    .attr("class", "brush")
	    .call(brush);

	brushg.selectAll(".resize").append("path")
	    .attr("transform", "translate(0," +  height / 2 + ")")
	    .attr("d", arc);

	brushg.selectAll("rect")
	    .attr("height", height);*/
	   
	var brushg = svg.append("g")
	    .attr("class", "brush")
	    .call(brush);

	// define the handles
	brushg.selectAll(".resize rect")
			.attr("height", height)
			.attr("width", 2)
			.attr("x", 0)
			.attr("fill", "#ccc")
			.attr("stroke-width",0)
			.attr("style", "visibility: visible");

	// set the height of the draggable scope
	brushg.selectAll("rect.extent")
			.attr("height", height)

	//these ones only for getting a widder hit area
	brushg.selectAll(".resize").append("rect")
				.attr("width", 10)
				.attr("x", -5)
				.attr("height", height )
				.attr("style", "visibility: hidden");

	brushstart();
	brushmove();

	function brushstart() {
		
		svg.classed("selecting", true);
	}

	function brushmove() {
		
		var s = brush.extent(), min = s[0], max = s[1];
		rect.classed("selected", function(d) {
			return min <= d && d <= max;
		});
		
		console.log('min='+min+' max='+max);
	}

	function brushend() {
		
		svg.classed("selecting", !d3.event.target.empty());
	}

	var defs = svg.append("defs");

	var filter = defs.append("filter")
			.attr("id", "drop-shadow")

	filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 0)
			.attr("result", "blur");
			
	filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 1)
			.attr("dy", 0)
			.attr("result", "offsetBlur");

	var feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode")
			.attr("in", "offsetBlur")
	feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");
			
	function sortAdsPerDay(ads) {
	
		var dateToCount = {}, d, days, days = [];
		
		for (var i=0; i < ads.length; i++) {
			
		  //d = new Date(ads[i].found), // TESTING ONLY
		  d = new Date(randomDate(new Date(2014, 5, 5), new Date())), 
		  	day = getDay(d);
		  
		  if (!dateToCount[day])
		  	dateToCount[day] = [];
		  
		  dateToCount[day].push(ads[i]);
		}
		
		var i=0, min=new Date(2099, 5, 5), max=new Date(1);
		for (var key in dateToCount) {	
			
		   if (dateToCount.hasOwnProperty(key))
	
				var obj = dateToCount[key], day = new Date(key);
				
				days.push({
					id : i++,
					date :  format(day),
					ads : obj,
					count : obj.length
				});
				
				if (day < min)
					min = day;
				if (day > max)
					max = day;
		}
	
		return days;
	}
	
	function getDay(dateObj) {
	
		var month = (dateObj.getUTCMonth() + 1);
		var day = (dateObj.getUTCDate());
		var year = dateObj.getUTCFullYear();
		return year + "/" + month + "/" + day;
	}

	function randomDate(start, end) {
	    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
	
}// end historySlider

function log(m) { console.log(m); }

var pal = {
    "orange1": "#EC652B",
    "orange2": "#F6BB9E",
    "orange3": "#F28E5F",
    "orange4": "#D85C32",
	"orange5": "#9D3915",
	"grey1": "#6B656A"
  };

function draw_area_figure1(data, chart_id, margin, width, height,chart_config){

var groups = ["africa","asia","europe","north_america","south_america"];

var labels = ["Africa", "Asia", "Europe", "North America", "South America"];

var dateParse = d3.timeParse("%d/%m/%Y");
data.forEach(function(d){d.date = dateParse(d.date);
});

var sumstat = d3.nest()
.key(function(d) { return d.date;})
.entries(data);

var stackedData = d3.stack()
    .keys(groups)
    .value(function(d,key){return d.values[0][key]})(sumstat)

var svg = d3.select("#"+chart_id)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal()
	.domain(groups)
	.range([pal.orange1,pal.orange2,pal.orange3,pal.orange4,pal.orange5]);

var label = function(d){return labels[groups.findIndex(group => group === d.key)]};

var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]).nice();

var y = d3.scaleLinear()
  .domain([0, d3.max(stackedData, function(d) {return d[d.length-1][1]/1000000; })])
  .range([ height, 0 ]).nice();
 
var gridlines = d3.axisLeft()
    .tickFormat("")
	.ticks(5)
	.tickSize(-width+2)
    .scale(y);

svg.append("g")
    .attr("class", "grid")
    .call(gridlines);

svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b")).tickSize(0).tickPadding(6));

svg.append("g")
	.attr("class", "yaxis")
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6));
	
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left)
    .attr("x",0 - (height / 1.8))
    .attr("dy", "1em")
    .attr('class','yaxistitle')
    .style("text-anchor", "middle")
    .text("Regional Covid-19 cases (millions)");

var day_month_format = d3.timeFormat("%d %b");

 // Add the area
 svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) {return color(d.key)})
      .attr("d", d3.area()
        .x(function(d) { return x(d.data.values[0].date); })
        .y0(function(d) { return y(d[0]/1000000); })
        .y1(function(d) { return y(d[1]/1000000); })
    )
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0];
        var yPosition = d3.mouse(this)[1];

        d.forEach(function(d){d.x_pos = x(d.data.values[0].date);
        d.day_month = day_month_format(d.data.values[0].date)});

		tooltip.style("left", d3.event.pageX+20+"px");
        tooltip.style("top", d3.event.pageY-25+"px");
        tooltip.style("display", "inline-block");
		
		var closest_year_distance = d3.min(d, function(i){return Math.abs(xPosition - i.x_pos)});
		var closest_year = d.filter(function(i){return Math.abs(xPosition - i.x_pos) == closest_year_distance});
		
		tooltip.html(label(d)+"<br/>"+closest_year[0].day_month+"<br/>"+((closest_year[0][1]-closest_year[0][0])/1000000).toFixed(1) + "m");
    });

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(475,0)");

var legend = d3.legendColor()
    .scale(color)
	.labels(labels)
	.ascending("True");
	
svg.select(".legendOrdinal")
  .call(legend);  
	 
var tooltip = d3.select("#"+chart_id)
	.append("div")
    .attr("class", "tooltip")
	.style("display", "none");   
	
}

function draw_area_figure2a(data, chart_id, margin, width, height,chart_config){

var dateParse = d3.timeParse("%d/%m/%Y");
data.forEach(function(d){d.dd = dateParse(d.date);
                        d.day_month = d3.timeFormat("%d %b")(d.dd);

});

var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.dd; }))
    .range([ 0, width ]).nice();

var y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.covid_cases_m; })])
  .range([ height, 0 ]).nice();
	
var svg = d3.select("#"+chart_id)
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var gridlines = d3.axisLeft()
    .tickFormat("")
	.ticks(5)
	.tickSize(-width+2)
    .scale(y);

svg.append("g")
    .attr("class", "grid")
    .call(gridlines);

  // Add the area
svg.append("path")
    .datum(data)
    .attr("fill", pal.orange1)
    .attr("stroke", pal.orange1)
    .attr("stroke-width", 1.5)
    .attr("d", d3.area()
      .x(function(d) { return x(d.dd) })
      .y0(y(0))
      .y1(function(d) { return y(d.covid_cases_m) })
      )
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
        var xPositionhold = d3.mouse(this)[0];
        var yPositionhold = d3.mouse(this)[1];
        var xPosition = x.invert(d3.mouse(this)[0]);
        var yPosition = y.invert(d3.mouse(this)[1]);
        console.log(xPosition);
        var closest_year_distance = d3.min(data, function(d){ return Math.abs(xPosition - d.dd)});
        var closest_year = data.filter(function(d){return Math.abs(xPosition - d.dd) == closest_year_distance})[0].day_month;
        var closest_value = data.filter(function(d){return Math.abs(xPosition - d.dd) == closest_year_distance})[0].covid_cases_m;
        console.log(d);
        tooltip.style("left", d3.event.pageX+20+"px");
        tooltip.style("top", d3.event.pageY-25+"px");
        tooltip.style("display", "inline-block");
        tooltip.html(closest_year+"<br/>"+closest_value+"m")
		});

svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b")).tickSize(0).tickPadding(6));

svg.append("g")
    .attr("class", "yaxis")  
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6));
	
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left)
    .attr("x",0 - (height / 1.8))
    .attr("dy", "1em")
    .attr('class','yaxistitle')
    .style("text-anchor", "middle")
    .text("Covid-19 cases (millions)");

var tooltip = d3.select("#"+chart_id)
	.append("div")
    .attr("class", "tooltip")
	.style("display", "none");    

}

function draw_area_figure2b(data, chart_id, margin, width, height,chart_config){

var groups = ["all_paid","all_committed"];
var labels = ["Paid", "Committed"];

var dateParse = d3.timeParse("%d/%m/%Y");
data.forEach(function(d){d.date = dateParse(d.date);
});

var sumstat = d3.nest()
.key(function(d) { return d.date;})
.entries(data);

var stackedData = d3.stack()
    .keys(groups)
    .value(function(d,key){return d.values[0][key]})(sumstat);

var svg = d3.select("#"+chart_id)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal()
	.domain(groups)
	.range([pal.orange1,pal.orange2]);

var label = function(d){return labels[groups.findIndex(group => group === d.key)]};

var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]).nice();

var y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.all_total/1000000000; })])
  .range([ height, 0 ]).nice();

var day_month_format = d3.timeFormat("%d %b");

var gridlines = d3.axisLeft()
    .tickFormat("")
	.ticks(5)
	.tickSize(-width+2)
    .scale(y);

 svg.append("g")
    .attr("class", "grid")
    .call(gridlines);

svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b")).tickSize(0).tickPadding(6));

svg.append("g")
    .attr("class", "yaxis")  
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6));
	
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left)
    .attr("x",0 - (height / 1.8))
    .attr("dy", "1em")
    .attr('class','yaxistitle')
    .style("text-anchor", "middle")
    .text("Covid-19 emergency funding (US$ billions)");

 // Add the area
 svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) {return color(d.key)})
      .attr("d", d3.area()
        .x(function(d) { return x(d.data.values[0].date); })
        .y0(function(d) { return y(d[0]/1000000000); })
        .y1(function(d) { return y(d[1]/1000000000); })
    )
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0];
        var yPosition = d3.mouse(this)[1];
        d.forEach(function(d){d.x_pos = x(d.data.values[0].date);
        d.day_month = day_month_format(d.data.values[0].date)});

        var closest_year_distance = d3.min(d, function(i){return Math.abs(xPosition - i.x_pos)});
   
        var closest_year = d.filter(function(i){return Math.abs(xPosition - i.x_pos) == closest_year_distance});

        tooltip.style("left", d3.event.pageX+20+"px");
        tooltip.style("top", d3.event.pageY-25+"px");
        tooltip.style("display", "inline-block");
        tooltip.html(label(d) + "<br/>"+closest_year[0].day_month+"<br/>US$"+((closest_year[0][1]-closest_year[0][0])/1000000000).toFixed(1) + "bn");
    });

var tooltip = d3.select("#"+chart_id)
	.append("div")
    .attr("class", "tooltip")
	.style("display", "none");   
 		  
svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(475,0)");

var legend = d3.legendColor()
    .scale(color)
	.labels(labels)
	.ascending("True");
	
svg.select(".legendOrdinal")
  .call(legend); 
}

function draw_area_figure8(data, chart_id, margin, width, height,chart_config){

var groups = ["governments","ngos","red_cross","who","un","uncategorised"];
var labels = ["Governments","NGOs","Red Cross","WHO","UN","Uncategorised"];

var dateParse = d3.timeParse("%d/%m/%Y");
data.forEach(function(d){d.date = dateParse(d.date);
});

var sumstat = d3.nest()
.key(function(d) { return d.date;})
.entries(data);

var stackedData = d3.stack()
    .keys(groups)
    .value(function(d,key){return d.values[0][key]})(sumstat);

var svg = d3.select("#"+chart_id)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal()
	.domain(groups)
	.range([pal.orange1,pal.orange2,pal.orange3,pal.orange4,pal.orange5,pal.grey1]);

var label = function(d){return labels[groups.findIndex(group => group === d.key)]};

var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]);

var y = d3.scaleLinear()
  .domain([0, 100])
  .range([ height, 0 ]).nice();
 
var day_month_format = d3.timeFormat("%d %b");

var gridlines = d3.axisLeft()
    .tickFormat("")
	.ticks(5)
	.tickSize(-width+2)
    .scale(y);

 svg.append("g")
    .attr("class", "grid")
    .call(gridlines);

svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")).tickSize(0).tickPadding(6));

svg.append("g")
    .attr("class", "yaxis")  
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6));
	
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left)
    .attr("x",0 - (height / 1.8))
    .attr("dy", "1em")
    .attr('class','yaxistitle')
    .style("text-anchor", "middle")
    .text("Share of Covid-19 funding received (%)");		

 // Add the area
 svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) {return color(d.key)})
      .attr("d", d3.area()
        .x(function(d) { return x(d.data.values[0].date); })
        .y0(function(d) { return y(d[0]*100); })
        .y1(function(d) { return y(d[1]*100); })
    )
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0];
        var yPosition = d3.mouse(this)[1];
        d.forEach(function(d){d.x_pos = x(d.data.values[0].date);
        d.day_month = day_month_format(d.data.values[0].date)});

        var closest_year_distance = d3.min(d, function(i){return Math.abs(xPosition - i.x_pos)});
   
        var closest_year = d.filter(function(i){return Math.abs(xPosition - i.x_pos) == closest_year_distance});

        tooltip.style("left", d3.event.pageX+20+"px");
        tooltip.style("top", d3.event.pageY-25+"px");
        tooltip.style("display", "inline-block");
        tooltip.html(label(d) + "<br/>"+closest_year[0].day_month+"<br/>"+((closest_year[0][1]-closest_year[0][0])*100).toFixed(1) + "%");
    });

var tooltip = d3.select("#"+chart_id)
	.append("div")
    .attr("class", "tooltip")
	.style("display", "none");   

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(475,0)");

var legend = d3.legendColor()
    .scale(color)
	.labels(labels)
	.ascending("True");
	
svg.select(".legendOrdinal")
  .call(legend); 

}
"use strict";
var canvas = d3.select("#canvas");
canvas.attr("width", d3.select(canvas.node().parentElement).node().clientWidth)
  .attr("height", innerHeight*2/3)
  .style("background", "rgb(250, 250, 250)");
d3.select(".imageDetails")
  .attr("style", "height: "+canvas.attr("height")+"px;");
var config = {
  animationTime: 2000,
  transitionAnimationTime: 1000,
  animationTimeDelay: 10,
  margin: {l: 20, r: 20, t: 20, b: 20},
  lineHeight: 10
}

config.chartFrame = {x: config.margin.l, y: config.margin.t, width: canvas.attr("height")-config.margin.l-config.margin.r, height: canvas.attr("height")-config.margin.t-config.margin.b};

var paramsArray = [
  {key:"focal_length", display:"Focal Length"},
  {key:"aperture", display:"Aperture"},
  {key:"iso", display:"ISO"},
];

var currentAxis = "focal_length";
var masterData = [];

var baseURL = "https://api.500px.com/v1/photos?consumer_key=Qz0DzxoUenHQF9EUgjMfsRseXnrpj3TWqsZeNJCh";
var url = baseURL + "&rpp=1000&only=Landscapes&image_size=1,4&feature=fresh_yesterday";

function getData(page, maxPage) {
  url += "&page="+page;
  d3.json(url, function(error, json){
    console.log(page);
    var photos = json.photos.filter(function(d) { return d.taken_at }).map(function(d) {
      var year = +d.taken_at.slice(0, 4);
      var month = +d.taken_at.slice(5, 7) - 1;
      var date = +d.taken_at.slice(8, 10);
      var hour = +d.taken_at.slice(11, 13);
      var minute = +d.taken_at.slice(14, 16);
      var second = +d.taken_at.slice(17, 19);
      d.taken_at = new Date(year, month, date, hour, minute, second, 0);
      return d;
    });
    masterData = masterData.concat(photos);
    if (++page > 1/*+json.total_pages*/) {
      setTimeout(drawCharts, 0);
    } else {
      setTimeout(getData, 0, page, +json.total_pages);
    }
  });
}

getData(1, 10000);

function drawCharts() {
    var chartG = canvas.append("g").classed("chartG", true).style("opacity", 1);

    var scaleX = d3.scale.linear().domain(d3.extent(d3.range(0, 24))).range([0, config.chartFrame.width])

    console.log(scaleX.domain());

    var axis = d3.svg.axis()
      .ticks(24)
      .tickSize(-config.chartFrame.height, 0, 0)
      .scale(scaleX);

    chartG.append("g")
      .attr("transform", "translate("+config.chartFrame.x+","+config.chartFrame.height+")")
      .call(axis);
    console.log(masterData.map(function(d) { return d.taken_at.getHours(); }));
    var nestingFunction = d3.nest().key(function(d) { return d.taken_at.getHours(); });

    var plotData = nestingFunction.entries(masterData)
    console.log(plotData);
    chartG.append("g")
      .attr("transform", "translate("+config.chartFrame.x+",0)")
      .selectAll("g")
      .data(plotData)
      .enter()
      .append("g")
      .selectAll("image")
      .data(function(d) { return d.values.splice(0, 100); })
      .enter()
      .append("image")
      .attr("xlink:href", function(d) { return d.image_url; })
      .attr("x", function(d) { return scaleX(d.taken_at.getHours())-5; })
      .attr("y", function(d, i) { return config.chartFrame.height - (i+1)*10; })
      .attr("height", "10px")
      .attr("width", "10px");

      //<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
}

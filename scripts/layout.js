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
  margin: {l: 50, r: 50, t: 50, b: 50},
  lineHeight: 10
}

config.chartFrame = {l: 0, t: 0, width: canvas.attr("height")-config.margin.l-config.margin.r, height: canvas.attr("height")-config.margin.t-config.margin.b};

var paramsArray = [
  {key:"focal_length", display:"Focal Length"},
  {key:"aperture", display:"Aperture"},
  {key:"iso", display:"ISO"},
];

var currentAxis = "focal_length";
var masterData = {};

var baseURL = "https://api.500px.com/v1/photos?consumer_key=Qz0DzxoUenHQF9EUgjMfsRseXnrpj3TWqsZeNJCh";
var url = baseURL + "&rpp=1000&only=Landscapes&image_size=1,4&feature=fresh_yesterday";

d3.json(url, function(error, json){
  if (!error) {
    masterData = json.photos;
    console.log(masterData);
    // crossfilter(masterData);
    var chartG = canvas.append("g").classed("chartG", true).style("opacity", 1);

  } else {
    console.log(error);
    alert("there was an error loading the data");
  }
})

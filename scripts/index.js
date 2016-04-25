"use strict";
var svg = d3.select("#canvas")
  .attr("width", innerWidth)
  .attr("height", innerHeight)
  .style("background", "rgb(250, 250, 250)");

var config = {
  animationTime: 2000,
  transitionAnimationTime: 1000,
  animationTimeDelay: 10,
  margin: {l: 50, r: 50, t: 50, b: 50},
  lineHeight: 10
}
config.chartFrame = {l: 100, t: 150, width: innerWidth-config.margin.l-config.margin.r-100, height: innerHeight-200-config.margin.b};
var paramsArray = [
  {key:"focal_length", display:"Focal Length"},
  {key:"aperture", display:"Aperture"},
  {key:"iso", display:"ISO"},
]
var currentAxis = "focal_length";
var masterData = {};

d3.json("./data/500px.json", function(error, json){
  if (!error) {
    masterData = json;
    var titleText = svg.append("text")
      .classed("projectTitle", true)
      .html("A thousand landscapes from 500px's 'Editor's Choice'")
      .attr("style", "font-size: 2em;")
      .attr("x", config.margin.l)
      .attr("y", function() {return config.margin.t + d3.select(this).node().getBBox().height;});
    // config.chartFrame.t = titleText.node().getBBox().height + titleText.node().getBBox().x;

    var chartG = svg.append("g").classed("chartG", true).style("opacity", 1);

    var axisLabel = svg.append("text")
      .classed("axisLabel", true)
      .html("Focal Length")
      .attr("x", function(d) { return innerWidth/2 - d3.select(this).node().getBBox().width/2; })
      .attr("y", function(d) { return innerHeight-config.margin.b; })
      .on("click", function() {
        d3.select(".chartG")
          .transition()
          .duration(config.transitionAnimationTime)
          .style("opacity", 0.4)
          .each("end", function() {
            paramsG.selectAll("text")
              .data(paramsArray)
              .enter()
              .append("text")
              .html(function(d) { return d.display; })
              .on("click", function(d) {
                currentAxis = d.key;
                svg.select(".axisLabel")
                  .html(d.display);
                paramsG.selectAll("text")
                  .data([])
                  .exit()
                  .remove();
                  d3.select(".chartG")
                    .transition()
                    .duration(config.transitionAnimationTime)
                    .style("opacity", 1)
                    .each("end", function() {
                      changeChart();
                    })
              })
              .transition()
              .delay(function(d, i) { return config.animationTimeDelay*i; })
              .attr("x", function(d) { return innerWidth/2 - d3.select(this).node().getBBox().width/2; })
              .attr("y", function(d, i) { return innerHeight-config.margin.b - 30*(i+1); });

          });
      });

    var data = masterData.filter(function(d) {
      if (!d[currentAxis]) {
        return false;
      }
      return true;
    });

    var scaleX = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return +d[currentAxis]; })])
      .range([config.chartFrame.l, config.chartFrame.width+config.chartFrame.l]);

    data = data.filter(function(d) {
      if (isNaN(scaleX(+d[currentAxis]))) {
        return false;
      }
      return true;
    });

    var axisX = d3.svg.axis()
      .orient("bottom")
      .scale(scaleX);

    chartG.append("g")
      .attr("transform", "translate(0, "+(config.chartFrame.t+config.chartFrame.height)+")")
      .classed("axisX", true)
      .call(axisX);

    chartG.append("g")
      .classed("dotsG", true)
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return scaleX(d[currentAxis]); })
      .attr("cy", function(d, i) { return Math.random()*(config.chartFrame.height) + config.chartFrame.t; })
      .attr("r", function(d) { return d.highest_rating/20; })
      .attr("fill", function(d) { return "rgba("+d.colors[0].r+","+d.colors[0].g+","+ d.colors[0].b+", 0.9)"; })
      .on("mouseenter", function(d) {
        d3.select(".tip")
          .style("opacity", 1)
          .attr("style", "left: "+scaleX(d[currentAxis])+"px; top: "+d3.select(this).attr("cy")+"px; opacity:1;")
          .html(""+
            "<img src='"+d.images[0].url+"'/>"+
          "");
      })
      .on("mouseleave", function(d) {
        d3.select(".tip").attr("style", "display:none;");
      });
      var paramsG = svg.append("g").classed("paramsG", true);

  } else {
    alert("there was an error loading the data");
  }
})

function changeChart() {
  var data = masterData.filter(function(d) {
    if (!d[currentAxis]) {
      return false;
    }
    return true;
  });

  var scaleX = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return +d[currentAxis]; })])
    .range([config.chartFrame.l, config.chartFrame.width+config.chartFrame.l]);

  data = data.filter(function(d) {
    if (isNaN(scaleX(+d[currentAxis]))) {
      return false;
    }
    return true;
  });

  d3.select(".dotsG")
    .selectAll("circle")
    .on("mouseenter", function(d) {
      d3.select(".tip")
        .style("opacity", 1)
        .attr("style", "left: "+scaleX(d[currentAxis])+"px; top: "+d3.select(this).attr("cy")+"px; opacity:1;")
        .html(""+
          "<img src='"+d.images[0].url+"'/>"+
        "");
    })
    .on("mouseleave", function(d) {
      d3.select(".tip").attr("style", "display:none;");
    })
    .data(data)
    .attr("fill", function(d) { return "rgba(0, 0, 0, 0.5)"; })
    .transition()
    .duration(100)
    .delay(function(d, i) { return config.animationTimeDelay*i; })
    .attr("cx", function(d) { return scaleX(d[currentAxis]); })
    .attr("cy", function(d, i) { return Math.random()*(config.chartFrame.height) + config.chartFrame.t; })
    .attr("r", function(d) { return d.highest_rating/20; })
    .attr("fill", function(d) { return "rgba("+d.colors[0].r+","+d.colors[0].g+","+ d.colors[0].b+", 0.9)"; });

    var axisX = d3.svg.axis()
      .orient("bottom")
      .scale(scaleX);
    d3.select(".axisX")
      .transition()
      .duration(config.animationTime)
      .call(axisX);

}

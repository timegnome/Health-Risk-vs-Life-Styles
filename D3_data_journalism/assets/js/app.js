var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var choice_dict = {'poverty': 'In Poverty','income' :'Household Income(Median)',
                  'age': 'Age', 'smokes': 'Smoke', 'obesity': 'Obesity', 'healthcare':'Lacks Heathcare'
}
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(Censusdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(Censusdata, d => d[chosenXAxis]))
    .range([0, width]);

  return xLinearScale;

}
function yScale(Censusdata, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(Censusdata, d => d[chosenYAxis])*1.04,d3.min(Censusdata, d => d[chosenYAxis])])
    .range([height,0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${choice_dict[chosenXAxis]}: ${d[chosenXAxis]}%<br>${choice_dict[chosenYAxis]}: ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(Censusdata, err) {
  if (err) throw err;

  // parse data
  Censusdata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(Censusdata, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(Censusdata, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Censusdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "red")
    .attr("opacity", ".5");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr( 'id',  'xaxis')
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr( 'id',  'xaxis')  
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr( 'id',  'xaxis')
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income(Median)");

  var obesityLabel = labelsGroup.append("text")
    .attr( 'id',  'yaxis')
    .attr("x", 0 +svgWidth/4)
    .attr("y", 0 - svgHeight )
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokeLabel = labelsGroup.append("text")
    .attr( 'id',  'yaxis')
    .attr("x", 0 +svgWidth/4)
    .attr("y", 20 - svgHeight )
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smoke (%)");

  var healthcareLabel = labelsGroup.append("text")
    .attr( 'id',  'yaxis')
    .attr("x", 0 +svgWidth/4)
    .attr("y", 40 - svgHeight )
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Heathcare(%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis || value !== chosenYAxis) {

        // replaces chosenXAxis with value
        if (d3.select(this).attr('id') === 'xaxis')
          chosenXAxis = value;
        else
          chosenYAxis = value;
        console.log(value)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Censusdata, chosenXAxis);

        // updates x scale for new data
        yLinearScale = yScale(Censusdata, chosenYAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        //updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis)
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        switch (chosenXAxis) {
          case 'poverty':
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
           incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            break;
          case 'age':
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            break;
          case 'income':
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
            break;
        }
        switch (chosenYAxis) {
          case 'obesity':
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
            smokeLabel
            .classed("active", false)
            .classed("inactive", true);
           healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            break;
          case 'smoke':
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokeLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            break;
          case 'healtcare':
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokeLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
            break;
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

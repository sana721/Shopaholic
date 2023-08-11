//load csv data
Promise.all([d3.csv("data/bestsellers with categories.csv")]).then(function (
  values
) {
  //storing data from csv into files
  booksData = values[0];
  booksData = booksData.sort(function (a, b) {
    return a["Year"] - b["Year"];
  });
  console.log(booksData);

  lineChart(booksData);
  histogram(booksData);
  pieChart(booksData);
  scatterPlot(booksData);
  heatmap(booksData);
});

function heatmap(data) {
  // group and aggregate data
  var nested = d3.rollups(
    data,
    (v) => d3.mean(v, (d) => d["User Rating"]),
    (d) => d.Year,
    (d) => d.Genre
  );

  var tooltip = d3.select("#tooltip");

  var margin = { top: 20, right: 20, bottom: 50, left: 70 };
  var width = 1200 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var svg = d3
    .select("#heatmap")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      "0 0 " +
        (width + margin.left + margin.right) +
        " " +
        (height + margin.top + margin.bottom)
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var years = Array.from(new Set(data.map((d) => d.Year))).sort();
  var genres = Array.from(new Set(data.map((d) => d.Genre))).sort();

  // Flattening the data
  let flattened = nested.flat(Infinity);

  // Find min and max
  let minValue = d3.min(flattened, (d) =>
    typeof d === "number" ? d : undefined
  );
  let maxValue = d3.max(flattened, (d) =>
    typeof d === "number" ? d : undefined
  );

  // create scales
  var xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.05);

  var yScale = d3.scaleBand().domain(genres).range([height, 0]).padding(0.05);

  var colorScale = d3
    .scaleSequential()
    .domain([minValue, maxValue])
    .interpolator(d3.interpolateReds);

  // append rects
  nested.forEach(function ([year, [genre, genre2]]) {
    svg
      .append("rect")
      .attr("x", xScale(year))
      .attr("y", yScale(genre[0]))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", colorScale(genre[1]))
      .on("mousemove", function (event, d) {
        d3.select(this).attr("stroke", "black");
        tooltip.style("opacity", 0.9);
        tooltip
          .html(
            "Year: " +
              year +
              "<br/>Genre: " +
              genre[0] +
              "<br/>Average Rating: " +
              genre[1]
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("stroke", "none");
        tooltip.style("opacity", 0);
      });

    svg
      .append("rect")
      .attr("x", xScale(year))
      .attr("y", yScale(genre2[0]))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", colorScale(genre2[1]))
      .on("mousemove", function (event, d) {
        d3.select(this).attr("stroke", "black");
        tooltip.style("opacity", 0.9);
        tooltip
          .html(
            "Year: " +
              year +
              "<br/>Genre: " +
              genre2[0] +
              "<br/>Average Rating: " +
              genre2[1]
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("stroke", "none");
        tooltip.style("opacity", 0);
      });
  });

  // append axes
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g").attr("class", "y axis").call(yAxis);
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .text("Year");
}

function scatterPlot(data) {
  const tooltip = d3.select("#tooltip").style("opacity", 0);

  var margin = { top: 20, right: 20, bottom: 50, left: 70 };
  var width = 1200 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      "0 0 " +
        (width + margin.left + margin.right) +
        " " +
        (height + margin.top + margin.bottom)
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create scales
  var xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.Price))
    .range([0, width]);

  var yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.Reviews))
    .range([height, 0]);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .text("Price");

  svg.append("g").attr("class", "y axis").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Reviews");

  // append dots
  var dots = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(+d.Price))
    .attr("cy", (d) => yScale(+d.Reviews))
    .attr("r", 3)
    .attr("fill", "#20618D")
    .on("mousemove", function (event, d) {
      d3.select(this).attr("stroke", "black").attr("r", 5);
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          "Name: " +
            d.Name +
            "<br/>Author: " +
            d.Author +
            "<br/>Genre: " +
            d.Genre +
            "<br/>User Rating: " +
            d["User Rating"] +
            "<br/>Price: " +
            d.length +
            "<br/>Revies: " +
            d.length
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("stroke", "none").attr("r", 3);
      tooltip.style("opacity", 0);
    });

  // add event listener for slider
  d3.select("#rating").on("input", function () {
    var rating = this.value;
    d3.select("#sliderValue").text("User Rating < " + rating);
    dots.attr("fill", function (d) {
      return d["User Rating"] < rating ? "yellow" : "#20618D";
    });
  });
}

function pieChart(data) {
  // Define SVG dimensions
  var width = 1200;
  var height = 400;
  var radius = Math.min(width, height) / 2 - 10;

  var tooltip = d3.select('#tooltip')

  // Define color scale
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var genres;

  // Define pie layout
  var pie = d3
    .pie()
    .value(function (d) {
      return d.value;
    })
    .sort(null);

  // Define arc generator
  var arc = d3.arc().innerRadius(0).outerRadius(radius);

  // Create SVG element
  var svg = d3
    .select("#pieChart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Initialize with number of books per genre
  updatePieChart("Books");

  // Define legend dimensions
  var legendRectSize = 18;
  var legendSpacing = 4;

  // Add legend to the pie chart
  var legend = svg
    .selectAll(".legend")
    .data(genres)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = (height * genres.length) / 2;
      var horz = -2 * legendRectSize + radius * 2;
      var vert = i * height - offset;
      return "translate(" + horz + "," + vert + ")";
    });

  // Add colored squares to the legend
  legend
    .append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", (d, i) => color(i))
    .style("stroke", (d, i) => color(i));

  // Add text to the legend
  legend
    .append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing)
    .text(function (d) {
      return d;
    });

  // Update pie chart when selection changes
  d3.select("#select-pie").on("change", function () {
    updatePieChart(this.value);
  });

  function updatePieChart(selection) {
    // Compute data according to selection
    var nestedData; 
    if (selection === "Books") {
      nestedData = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.Genre
      );
    } else {
      nestedData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d.Reviews),
        (d) => d.Genre
      );
    }
    var pieData = Array.from(nestedData, ([key, value]) => ({ key, value }));
    genres = pieData.map(function (d) {
      return d.key;
    });

    // Join new data with old elements, if any
    var path = svg.selectAll("path").data(pie(pieData));

    // Exit old elements
    path.exit().remove();

    // Update existing elements
    path
      .attr("fill", function (d, i) {
        return color(i);
      })
      .transition()
      .duration(750)
      .attrTween("d", arcTween);

    // Enter new elements
    path
      .enter()
      .append("path")
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      })// Store the initial angles
      .on("mousemove", function (event, d) {  
        d3.select(this).attr("stroke", "black") ;
        tooltip.style("opacity", 0.9);
        tooltip
          .html(
            "Genre: " + d.data.key+
            "<br/>Number of "+selection+": " + d.data.value 

          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("stroke", "none").attr('r', 3);
        tooltip.style("opacity", 0);
      }) 
  }

  // Interpolate the arcs in data space
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function (t) {
      return arc(i(t));
    };
  }
}

function histogram(data) {
  const tooltip = d3.select("#tooltip").style("opacity", 0);

  var margin = { top: 20, right: 20, bottom: 50, left: 40 };
  var width = 1200 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var x = d3.scaleLinear().domain([3.2, 5]).range([0, width]);

  var histogram = d3.bin().domain(x.domain()).thresholds(x.ticks(15));

  var bins = histogram(
    data.map(function (d) {
      return +d["User Rating"];
    })
  );

  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(bins, function (d) {
        return d.length;
      }),
    ])
    .range([height, 0]);

  var svg = d3
    .select("#histogram")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      "0 0 " +
        (width + margin.left + margin.right) +
        " " +
        (height + margin.top + margin.bottom)
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .text("User Rating");

  svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Number of Books");

  var bar = svg
    .selectAll(".bar")
    .data(bins)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 1)
    .attr("transform", function (d) {
      return "translate(" + x(d.x0) + "," + y(d.length) + ")";
    })
    .attr("width", function (d) {
      return Math.max(0, x(d.x1) - x(d.x0) - 1);
    })
    .on("mousemove", function (event, d) {
      d3.select(this).attr("stroke", "black").style("fill", "#0056b3");
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          "User Rating: " +
            d.x0 +
            "-" +
            d.x1 +
            "<br/>" +
            "Number of Books: " +
            d.length
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("stroke", "none").style("fill", "#48C9B0");
      tooltip.style("opacity", 0);
    })
    .attr("height", 0) // start from zero height
    .transition() // add transition
    .duration(800)
    .attr("height", function (d) {
      return height - y(d.length);
    });
}

function lineChart(data) {
  var svgWidth = 1200,
    svgHeight = 400,
    margin = { top: 20, right: 20, bottom: 30, left: 50 };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width]).nice();
  var y = d3.scaleLinear().range([height, 0]).nice();

  var svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
    // .attr("width", svgWidth)
    // .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var line = d3
    .line()
    .x(function (d) {
      return x(d.key);
    })
    .y(function (d) {
      return y(+d.value);
    });

  var nestedData = d3.rollup(
    data,
    (v) => d3.mean(v, (d) => +d["User Rating"]),
    (d) => d.Year
  );

  var lineData = Array.from(nestedData, ([key, value]) => ({ key, value }));

  x.domain(
    d3.extent(lineData, function (d) {
      return +d.key;
    })
  );
  y.domain([
    0,
    d3.max(lineData, function (d) {
      return d.value;
    }),
  ]);

  svg.append("path").datum(lineData).attr("class", "line").attr("d", line);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

  var xAxisLabel = svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Year");

  var yAxisLabel = svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("User Rating");

  d3.select("#select").on("change", function () {
    var value = this.value;

    nestedData = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => +d[value]),
      (d) => d.Year
    );

    lineData = Array.from(nestedData, ([key, value]) => ({ key, value }));

    y.domain([
      0,
      d3.max(lineData, function (d) {
        return d.value;
      }),
    ]);

    yAxisLabel.text(value);

    svg
      .selectAll(".line")
      .datum(lineData)
      .transition()
      .duration(750)
      .attr("d", line);

    svg.selectAll(".y.axis").transition().duration(750).call(d3.axisLeft(y));
  });
}

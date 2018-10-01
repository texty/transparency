//    var formatLabel = function(d) { return d3.format('.0f')(d * 100); };

var margin = {top: 120, right: 10, bottom: 10, left: 200},
    width = window.innerWidth - margin.left - margin.right,
    height = 2000 - margin.top - margin.bottom;

var graphic = d3.select('.graphic');

var svg = graphic.select('svg.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x = function (d) {
        return d.share / 100;
    },
    xScale = d3.scaleLinear(),
    xValue = function (d) {
        return xScale(x(d));
    };

var y = function (d) {
        return d.social_network
    },
    yScale = d3.scaleBand().range([height, 0]).padding(0.1),
//            yValue = function (d) {
//                return yScale(y(d));
//            },
//            yValue = function (d, i) {   return i * height / 100   },
    yAxis = d3.axisLeft(yScale);

var column = function (d) {
        return d.usage;
    },
    columnScale = d3.scaleBand().range([0, width - margin.right - margin.left]).paddingInner(0.1),
    columnValue = function (d) {
        return columnScale(column(d));
    };

var color = column,
    colorScale = d3.scaleOrdinal(),
    colorValue = "#3695d8";
//            colorValue = function(d) { return colorScale(color(d)); };

function row(d) {
    return {
        usage: d.usage,
        social_network: d.social_network,
        share: +d.share,
        value: +d.value
    };
}

d3.csv('data/gathered.csv', row, function (error, dataFlat) {
    if (error) throw error;

    var data = d3.nest()
        .key(function (d) {
            return d.usage;
        })
        .entries(dataFlat)
        .map(function (d) {
            return {usage: d.key, values: d.values};
        });

    data.forEach(function (d) {
        d.values.sort(function (a, b) {
            return d3.ascending(+b.share, +a.share)
        });
    });

    yScale.domain(dataFlat.map(y).reverse());
    columnScale.domain(dataFlat.map(column));
    xScale.range([0, columnScale.bandwidth()]);

    // Excluding the light colors from the color scheme
    var colorRange = d3.schemeCategory10;
    colorScale
        .domain(dataFlat.map(color))
        .range(colorRange);

    svg.append('g').attr('class', 'axis axis--y')
        .call(yAxis);

    var gColumn = svg.append('g').attr('class', 'columns')
        .selectAll('.column').data(data)
        .enter().append('g')
        .attr('class', 'column')
        .attr("id", function (d, i) {
            return ("id" + i)
        })
        .attr('transform', function (d) {
            return 'translate(' + columnValue(d) + ',0)';
        });


    gColumn.append('text').attr('class', 'title')
        .attr('y', '0')
        .attr('dy', '0')
        .text(column)
        .call(wrap, 200)
        .attr("transform", "rotate(-90)");

    var bars = gColumn.append('g').attr('class', 'bars');


    bars.selectAll('.bar--overlying')
        .data(function (d) {
            return d.values;
        })
        .enter().append('rect')
        .attr('class', 'bar bar--overlying')
        .attr('x', function (d) {
            return width - xScale(x(d)) / 2 - width + 20;
        })
        // .attr('y', function(d) { return yScale(y(d)); }) //варіант, коли місто по лінії
        .attr('y', function (d, i) {   return i * height / 100   })
        .attr('width', function (d) {
            return xScale(x(d));
        })
        .attr('height', yScale.bandwidth())
        .style('fill', colorValue)
        .attr('value', function (d) {
            var thisCity = d.social_network;
            return thisCity;
        })
        .on("mouseover", function (d) {
            var city = d.social_network;
            d3.selectAll(".bar").each(function (z) {
                if (z.social_network === city) {
                    d3.select(this).style("opacity", 1);
                    d3.select(this).style("border", "1px solid black");
//                            d3.select(this).parent().find(".label").style("display", "block");
                }
                else {
                    d3.select(this).style("opacity", 0.1)
                }

            });
            //  місто, яке по ховеру стає кольоровим
            d3.selectAll("text").each(function (l, i) {
                var citylabel = d3.select("text").html();
                if (l === city) {
                    d3.selectAll("text").style("fill", "black").style("font-weight", "400");
                    d3.select(this).style("fill", "#3695d8");
                    d3.select(this).style("font-weight", "800");
                }
            });
//                    d3.selectAll(".label").each(function (z) {
//                        if (z.social_network === city) {
//                            d3.select(this).style("display", "block");
//                        }
//                    })
        })

        .on("mouseout", function () {
            d3.selectAll("text").style("fill", "black").style("font-weight", "400");
//                    d3.selectAll(".label").style("display", "none")


        });


    bars.selectAll(".label")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append('text')
        .attr('x', function (d) {
            if(d.value > 0) {
                return columnScale.bandwidth() / 2;
            } else {
                return columnScale.bandwidth() / 2;
            }
        })
                       .attr('y', function (d, i) {  return i * height / 100  + (yScale.bandwidth() / 1.5) })
        // .attr('y', function(d) { return yScale(y(d)) + (yScale.bandwidth() / 1.5); }) //варіант, коли місто по лінії

        .attr('class', 'label')
        .text(function (d) {
            return d.value
        })
        .style("text-anchor", "middle");


    function positionLabel(d) {
        var xValue = xScale(x(d));
        var xMax = xScale.range()[1];//
        d3.select(this)
            .classed('label--white', false)
            .attr('x', 0)
            .attr('dx', 10)
        ;


        d3.select(this)
            .attr('y', yScale(y(d)) + (yScale.bandwidth() / 2))
            //                    .attr('x', xScale(x(d)) + (xScale.bandwidth() / 2))
            //                    .attr('y', function(d, i){ return  i * height / 100})

            .attr('dy', '0.3em');
    }

//        gColumn.append('g').attr('class', 'labels')
//                .selectAll('.label').data(function(d) {
//                    return d.values;
//                })
//                .enter().append('text')
//                .attr('class', 'label')
//                .text(function(d) {
//                    return d.value;
//                })
//                .each(positionLabel)
//        ;

});


function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, // ems
            y = text.attr("y"),

            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 10).attr("y", 15).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 10).attr("y", 15).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}


d3.selectAll("g.tick > text").attr("x", -50);

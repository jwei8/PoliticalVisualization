class ScatterPlot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, _data, _displatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 720,
      containerHeight: 260,
      margin: {
        top: 30,
        right: 15,
        bottom: 20,
        left: 30
      },
      tooltipPadding: 15
      // Todo: Add or remove attributes from config as needed
    }
    this.initVis();
    this.data = _data;
    this.dispatcher = _displatcher;
  }

  initVis() {
    let vis = this;
     // Calculate inner chart size. Margin specifies the space around the actual chart.
     vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
     vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
 
     // Define size of SVG drawing area
     vis.svg = d3.select(vis.config.parentElement)
       .attr('width', vis.config.containerWidth)
       .attr('height', vis.config.containerHeight);
 
     // Append group element that will contain our actual chart
     // and position it according to the given margin config
     vis.chartArea = vis.svg.append('g')
       .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
       .attr('width', vis.width)
       .attr('height', vis.height);

    vis.xScale = d3.scaleLinear()
       .range([0, vis.width]);
   
    vis.yScale = d3.scaleLinear()
       .range([vis.height, 0]);
   
    vis.xAxis = d3.axisBottom(vis.xScale)
       .tickSize(-vis.height - 10);
   
    vis.yAxis = d3.axisLeft(vis.yScale)
       .tickSize(-vis.width - 10);
    
    vis.xAxisG = vis.chartArea.append('g')
       .attr('class', 'axis x-axis')
       .attr('transform', `translate(0,${vis.height})`);
   
    vis.yAxisG = vis.chartArea.append('g')
       .attr('class', 'axis y-axis')
    
    vis.svg.append('text')
       .attr('class', 'axis-label')
       .attr('x', vis.width)
       .attr('y', vis.height + 20)
       .attr('text-anchor', 'end')
       .style('font-weight', 'bold')
       .text('GDP per Capita (US$)');
   vis.svg.append('text')
       .attr('class', 'axis-label')
       .attr('x', 30)
       .attr('y', 15)
       .attr('text-anchor', 'end')
       .style('font-weight', 'bold')
       .text('Age');
 
  }

 

  updateVis() {
    let vis = this;
    // Todo: Prepare data and scales

    vis.data = vis.data.filter(d => d.pcgdp !== null);

    if (currentGender !== null) {
      selectedItems = selectedItems.filter(d => d.gender === currentGender)
    }
  
    vis.xValue = d => d.pcgdp;
    vis.yValue = d => d.start_age;
  
    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([25, 95]);
  
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Add circles
        const circles = vis.chartArea.selectAll('.point')
            .data(vis.data)
            .join('circle')
            .attr('r', 5)
            .attr('class', 'point')
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('fill', function (d) {
                if (selectedItems.includes(d)) {
                    return '#4C4CE8';
                } else {
                    return '#C8C8E1';
                }
            })
            .attr('stroke', null)
            .attr('stroke-width', null)
            .attr('fill-opacity', d => {
                if (currentGender == null || d.gender === currentGender) {
                    return 0.7;
                } else {
                    return 0.1;
                }
            })

        // tooltip format referenced form p1
        circles.on("mouseover.tooltip", (event, d) => {
            if (currentGender === null || d.gender === currentGender) {

                let gdp = d.pcgdp === null ? 'missing' : Math.round(d.pcgdp);
                let duration = d.duration <= 1 ? d.duration + ' year' : d.duration + ' years';
                d3.select("#tooltip")
                  .style("display", "block")
                  .style("left", (event.pageX + 15) + "px")
                  .style("top", (event.pageY + 15) + "px").html(`
              <div style="font-size: 13px;"><strong>${d.leader}</strong></div>
              <div style="font-style: italic; font-size: 12px;">${d.country}, ${d.start_year}-${d.end_year}</div> 
              <li style="font-size: 12px;">Age at inauguration: ${d.start_age}</li>
              <li style="font-size: 12px;">Time in office: ${duration}</li>
              <li style="font-size: 12px;">GDP/capita: ${gdp}</li>
            `);
            }

          }).on('mouseover.point', function (event, d) {
            if (currentGender === null || d.gender === currentGender) {
                if (!selectedItems.includes(d)) {
                    d3.select(this)
                        .attr('stroke', 'black')
                        .attr('fill', "#26115d")
                        .attr('stroke-width', 1);
                } else {
                    d3.select(this)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1);
                }
            }
        }).on("mouseleave.tooltip", () => {
            d3.select("#tooltip").style("display", "none");
        }).on('mouseleave.point', function (event, d) {
            if (currentGender === null || d.gender === currentGender) {
                if (!selectedItems.includes(d)) {
                    d3.select(this)
                        .attr('stroke', null)
                        .attr('stroke-width', null)
                        .attr('fill', '#7B68EE')
                } else {
                    d3.select(this)
                        .attr('stroke', null)
                        .attr('stroke-width', null)
                }
            }
        })

        circles.on('click', function (event, d) {
          if (currentGender === null || d.gender === currentGender) {
              // if index exists in selectedCategories, remove it; otherwise add it
              if (selectedItems.includes(d)) {
                  selectedItems.splice(selectedItems.indexOf(d), 1);
              } else {
                  selectedItems.push(d);
              }
          }
          vis.dispatcher.call('selectedItems', event);
      })
     
      vis.svg.on("click", function (event) {
     
          if (event.target.id === "scatter-plot") {
              selectedItems = [];
              vis.dispatcher.call('selectedItems', event);
          }
          vis.dispatcher.call('selectedItems', event);
      });
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    vis.xAxisG.select('.domain').remove();
    vis.yAxisG.select('.domain').remove();

    vis.xAxisG.selectAll('.tick line').attr('stroke', '#adadad');
    vis.yAxisG.selectAll('.tick line').attr('stroke', '#adadad');

    vis.yAxisG.selectAll('text')
            .attr('fill-opacity', 0.6)
            .style('font-size', '11px');

    vis.xAxisG.selectAll('text')
            .attr('fill-opacity', 0.6)
            .style('font-size', '11px');
  }

}
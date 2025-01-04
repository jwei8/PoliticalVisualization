class LexisChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, _data, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 380,
      margin: {
        top: 15,
        right: 15,
        bottom: 20,
        left: 25
      },
      tooltipPadding: 15
      // Todo: Add or remove attributes from config as needed
    }
    this.initVis();
    this.data = _data;
    this.dispatcher = _dispatcher;
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Apply clipping mask to 'vis.chart' to clip arrows
    vis.chart = vis.chartArea.append('g')
      .attr('clip-path', 'url(#chart-mask)');

    // Initialize clipping mask that covers the whole chart
    vis.chart.append('defs')
      .append('clipPath')
      .attr('id', 'chart-mask')
      .append('rect')
      .attr('width', vis.config.width + 5)
      .attr('y', -vis.config.margin.top)
      .attr('height', vis.config.containerHeight);

    // Helper function to create the arrows and styles for our various arrow heads
    vis.createMarkerEnds();

    // Todo: initialize scales, axes, static elements, etc.
    // X-scale based on years
    vis.xScale = d3.scaleLinear()
      .domain([1950, 2023])
      .range([0, vis.config.width]);

    // Y-scale based on age
    vis.yScale = d3.scaleLinear()
      .domain([25, 95])
      .range([vis.config.height, 20]);

    // Initialize axes:
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(8)
      .tickFormat(d3.format("d"));  // format as whole numbers

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat(d3.format('d'))
      .ticks(6);

    // Append axes to the chartArea
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${vis.config.height})`);

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'y-axis');


      vis.svg.append('text')
      .attr('class', 'axis-label')
      .attr('x',30)
      .attr('y', 10)
      .attr('dy', '1em')
      .style('font-weight', 'bold')
      .style('text-anchor', 'end')
      .text('Age');

    // from p1
    vis.chartArea.append('defs')
          .append('clipPath')
          .attr('id', 'chart-mask')
          .append('rect')
          .attr('width', vis.width)
          .attr('y', -vis.config.margin.top)
          .attr('height', vis.config.containerHeight);
    
    vis.chart = vis.chartArea.append('g')
                  .attr('clip-path', 'url(#chart-mask)');

  }


  updateVis() {
    let vis = this;
    
    vis.x1 = d => d.start_year;
    vis.x2 = d => d.end_year;
    vis.y1 = d => d.start_age;
    vis.y2 = d => d.end_age;

    vis.renderVis();
  } 


  renderVis() {
    const vis = this;

    // Constants for stroke weights
    const STROKE_DEFAULT = 1;
    const STROKE_HOVER = 2;
    const STROKE_HIGHLIGHTED = 3;

    // Todo: Bind data to visual elements (enter-update-exit or join)
    const arrows  = vis.chart.selectAll('.arrow')
            .data(vis.data)
            .join('line')
            .attr('class', 'arrow')
            .attr('stroke', determineStrokeColor)
            .attr('stroke-width', determineStrokeWidth)
            .style('marker-end', determineArrowHeadStyle)
            .attr('x1', d => vis.xScale(vis.x1(d)))
            .attr('x2', d => vis.xScale(vis.x2(d)))
            .attr('y1', d => vis.yScale(vis.y1(d)))
            .attr('y2', d => vis.yScale(vis.y2(d)));

    // display leader names
    vis.chart.selectAll('.arrow-label')
            .data(vis.data)
            .join('text')
            .attr('class', 'arrow-label')
            .attr('transform', d => 
                `translate(${(vis.xScale(vis.x1(d)) + vis.xScale(vis.x2(d))) / 2 - 4},
                ${(vis.yScale(vis.y1(d)) + vis.yScale(vis.y2(d))) / 2 - 4}) rotate(-20)`)
            .text(determineTextLabel)
            .style('font-weight', 'bold') 
            .attr('font-size', '12px');
    
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

    // Functions to determine arrow and label properties
    function determineStrokeColor(d) {
        if (selectedItems.includes(d)) {
            return '#f8c50e';
        } else if (d.label === 1) {
            return '#C8C8E1';
        }
        return '#ddd';
    }

    function determineStrokeWidth(d) {
        return (d.label === 1 || selectedItems.includes(d)) ? STROKE_HIGHLIGHTED : STROKE_DEFAULT;
    }

    function determineArrowHeadStyle(d) {
        if (selectedItems.includes(d)) {
            return 'url(#arrow-head-highlighted-selected)';
        } else if (d.label === 1) {
            return 'url(#arrow-head-highlighted)';
        }
        return 'url(#arrow-head)';
    }

    function determineTextLabel(d) {
        return (d.label === 1 || selectedItems.includes(d)) ? d.leader : '';
    }

    arrows.on('click', function(event, d) {
      if (selectedItems.includes(d)) {
        selectedItems.splice(selectedItems.indexOf(d), 1);
      } else {
        selectedItems.push(d);
      }
      vis.dispatcher.call('selectedItems', event);
    })

    arrows.enter().remove();


    //referred from p1
    arrows
    .on("mouseover.tooltip", (event, d) => {

        let gdp = d.pcgdp === null ? 'missing' : Math.round(d.pcgdp);
        let duration = d.duration <= 1 ? d.duration + ' year' : d.duration + ' years';

        d3.select("#tooltip")
            .style("display", "block")
            .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
            .style("top", (event.pageY + vis.config.tooltipPadding) + "px")
            .html(`
          <div style="font-size: 13px;"><strong>${d.leader}</strong></div>
          <div style="font-style: italic; font-size: 12px;">${d.country}, ${d.start_year}-${d.end_year}</div> 
          <li style="font-size: 12px;">Age at inauguration: ${d.start_age}</li>
          <li style="font-size: 12px;">Time in office: ${duration}</li>
          <li style="font-size: 12px;">GDP/capita: ${gdp}</li>
    `);
    })
    .on("mouseleave.tooltip", () => {
        d3.select("#tooltip").style("display", "none");
    })
    .on("mouseover.arrow", function (event, d) {
        if (!selectedItems.includes(d) && d.label !== 1) {
            d3.select(this)
                .style('marker-end', 'url(#arrow-head-hover)')
                .attr('stroke', '#C8C8E1')
                .attr('stroke-width', STROKE_HOVER);
        }
    })
    .on("mouseleave.arrow", function (event, d) {
        if (!selectedItems.includes(d) && d.label !== 1) {
            d3.select(this)
                .style('marker-end', 'url(#arrow-head)')
                .attr('stroke', '#ddd')
                .attr('stroke-width', STROKE_DEFAULT);
        }
    })
}

  /**
   * Create all of the different arrow heads.
   * Styles: default, hover, highlight, highlight-selected
   * To switch between these styles you can switch between the CSS class.
   * We populated an example css class with how to use the marker-end attribute.
   * See link for more info.
   * https://observablehq.com/@stvkas/interacting-with-marker-ends
   */
  createMarkerEnds() {
    // Default arrow head
    // id: arrow-head
    let vis = this;
    
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#ddd')
      .attr('fill', '#ddd');

    // Hovered arrow head
    // id: arrow-head-hovered
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-hovered')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#888')
      .attr('fill', '#888');

    // Highlight arrow head
    // id: arrow-head-highlighted
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#aeaeca')
      .attr('fill', '#aeaeca');

    // Highlighted-selected arrow head
    // id: arrow-head-highlighted-selected
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted-selected')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#e89f03')
      .attr('fill', '#f8c50e');
  }
}
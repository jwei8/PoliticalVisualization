class BarChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, data, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 240,
      containerHeight: 260,
      margin: {
        top: 30,
        right: 5,
        bottom: 20,
        left: 30
      }
      // Todo: Add or remove attributes from config as needed
    }
    this.dispatcher = _dispatcher;
    this.data = data;
    this.initVis();
  }

  initVis() {
    let vis = this;

  // Set drawing area
  vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
  vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
  vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.3);
  
  vis.yScale = d3.scaleLinear() 
      .range([vis.height, 0]);

  // Initialize axes
  vis.xAxis = d3.axisBottom(vis.xScale);

  vis.yAxis = d3.axisLeft(vis.yScale)
                .tickSize(-vis.width)
                .ticks(5);
                
  // Create SVG area
  vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

  // Append a group element to the SVG, this will contain all other chart elements
  vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
  // Append x-axis group and move it to the bottom of the chart
  vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`);

  // Append y-axis group
  vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');
  
  // Append y-axis label
  vis.chart.append('text')
          .attr('class', 'axis-label')
          .attr('x', 30)
          .attr('y', -10)
          .attr('text-anchor', 'end')
          .style('font-weight', 'bold')
          .text('Gender');
  }

  updateVis() {
    let vis = this;
    // Todo: Prepare data and scales
    const processedDataMap = d3.rollups(vis.data, v => v.length, d => d.gender);
    vis.processedData = Array.from(processedDataMap, ([key, count]) => ({key, count}));

    console.log(processedDataMap);
    vis.xValues = d => d.key;
    vis.yValues = d => d.count;

    vis.xScale.domain(vis.processedData.map(vis.xValues));
    vis.yScale.domain([0, d3.max(vis.processedData, vis.yValues)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    // Todo: Bind data to visual elements, update axes

    let bar = vis.chart.selectAll('.bar')
        .data(vis.processedData, vis.xValues)
        .join('rect')
        .attr('class', 'bar')
        .attr('width', vis.xScale.bandwidth() * 0.7)
        .attr('height', d => vis.height - vis.yScale(vis.yValues(d)))
        .attr('x', d => vis.xScale(vis.xValues(d)) + vis.xScale.bandwidth() * 0.1)
        .attr('y', d => vis.yScale(vis.yValues(d)))
        .attr('fill', '#C8C8E1');
    // add a hover effect
    bar.on('mouseover', function () {
      d3.select(this)
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
  }).on('mouseleave', function () {
      d3.select(this)
          .attr('stroke', null)
          .attr('stroke-width', null);
  });

  // add a click event
  bar.on('click', function (event) {

      const selectedGender = d3.select(this).data()[0].key;

      if (selectedGender === currentGender) {
          vis.chart.selectAll('.bar')
              .attr('fill', '#C8DCE1')
              .attr('fill-opacity', 0.7)
      } else {
          vis.chart.selectAll('.bar')
              .attr('fill', '#C8DCE1')
              .attr('fill-opacity', 0.7)
          d3.select(this).attr('fill', '#4C4CE8');
      }

      vis.dispatcher.call('filterGender', event, selectedGender);
  });
    
    vis.xAxisG.call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);

    // lighten x-grid line color
    vis.xAxisG.selectAll('.tick line')
      .attr('stroke', '#adadad');

    // lighten y-axis line color
    vis.yAxisG.selectAll('.tick line')
      .attr('stroke', '#adadad');
      
    // remove x-axis line
    vis.xAxisG.select('.domain').remove();
    vis.xAxisG.selectAll('.tick line').remove();

    // remove y-axis line
    vis.yAxisG.select('.domain').remove();

    //lighten up label colors
    vis.xAxisG.selectAll('text')
    .attr('fill-opacity', 0.6)
    .style('font-size', 11);

    vis.yAxisG.selectAll('text')
    .attr('fill-opacity', 0.6)
    .style('font-size', 11);
  }
}
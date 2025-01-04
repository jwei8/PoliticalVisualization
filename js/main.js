let filteredData;
let data, lexisChart, barChart, scatterplot;
let selectedItems = [];
let currentGender = null;
const dispatcher = d3.dispatch('filterGender','selectedItems');

d3.csv('data/leaderlist.csv').then(loadedData => {
  data = loadedData; // Assign the loaded data to the outer 'data' variable
  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr == 'pcgdp') {
        d[attr] = (d[attr] == 'NA') ? null : +d[attr];
      } else if (attr != 'country' && attr != 'leader' && attr != 'gender') {
        d[attr] = +d[attr];
      }
    });
  });

  data = data.filter(d => {
    return d.duration > 0;
  });

  data.sort((a,b) => a.label - b.label);

  let defaultData = data.filter(d => {
    return d['oecd'] == 1;
  });

  filteredData = defaultData;

  lexisChart = new LexisChart({parentElement: "#lexis-chart"}, defaultData, dispatcher);
  lexisChart.updateVis();

  barChart = new BarChart({parentElement: '#bar-chart'}, defaultData, dispatcher);
  barChart.updateVis();

  scatterplot = new ScatterPlot({parentElement: "#scatter-plot"}, defaultData, dispatcher);
  scatterplot.updateVis();

}).catch(error => console.error(error));

d3.select('#country-selector').on('change', function() {
  currentGender = null;
  selectedItems = [];

  const country_selected = d3.select(this).property('value');
  filteredData = data.filter(d => d[country_selected] == 1);

  barChart.data = filteredData;
  lexisChart.data = filteredData;
  scatterplot.data = filteredData;

  barChart.updateVis();
  lexisChart.updateVis();
  scatterplot.updateVis();
});

dispatcher.on('filterGender', selectedGender => {
  let filterByGender;

  if (selectedGender == currentGender) {
    currentGender = null;
    filterByGender = filteredData;
  } else {
    currentGender = selectedGender;
    filterByGender = filteredData.filter(p => p.gender === selectedGender);
  }
  barChart.data = filterByGender;
  lexisChart.data = filterByGender;

  lexisChart.updateVis();
  scatterplot.updateVis();
});

dispatcher.on('selectedItems', () => {
  lexisChart.updateVis();
  scatterplot.updateVis();
});

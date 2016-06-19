function LineChart(config) {
  this._datalink = config.datalink;
  this._data = config.data;

  this.init();
}

LineChart.prototype = {
  _data: null,
  _datalink: null,

  _minValue: Number.MIN_SAFE_INTEGER,
  _maxValue: Number.MAX_SAFE_INTEGER,
  _step: 10000,

  init: function() {
    this.dom = {};
    this.dom.root = document.createElement('div');
    this.dom.title = $('<div class="chart_title"></div>');
    this.dom.desc = $('<div class="chart_desc"></div>');
    this.dom.menu = $('<button id="menu"><i class="fa fa-align-justify fa-2x"></i></button>');
    this.dom.chart = $('<canvas id="line_chart" width="500px" height="250px"></canvas>');
    this.dom.legends = $('<div class="legends"></div>');

    $(this.dom.root).addClass('chart')
      .append([this.dom.title, this.dom.desc, this.dom.menu, this.dom.chart])
      .append($('<div class="chart_legend"></div>').append(this.dom.legends));

    $(this.dom.menu).click((function() {
      this.draw();
    }).bind(this));
  },

  render: function(parent) {
    $(parent).append($(this.dom.root));

    if (this._data) {
      this.draw();
    } else {
      this.load(this.draw.bind(this));
    }
  },

  load: function(callback) {
    if (this._datalink) {
      $.getJSON(this._datalink + this.cache(), (function(data) {
        this._data = data;

        if (typeof callback == 'function')
          callback();
      }).bind(this));
    }
  },

  draw: function() {
    $(this.dom.title).html(this._data.title);
    $(this.dom.desc).html(this._data.desc);
    $(this.dom.legends).empty();

    $.each(this._data.datasets, (function(index, dataset) {
      $(this.dom.legends).append(this.getLegend(dataset));
    }).bind(this));

    const ctx = $(this.dom.chart)[0].getContext("2d");
    new Chart(ctx).Line(this.fetchData(), {
      bezierCurve: false,
      //animation: false,
      scaleOverride: true,
      scaleSteps: (this._maxValue - this._minValue) / this._step,
      scaleStepWidth: this._step,
      scaleStartValue: this._minValue,
      scaleShowVerticalLines: false,
      scaleLabel: "<%=value/1000%>k",
      multiTooltipTemplate: "<%= datasetLabel %> - <%=(Number.withCommas(value))%>",
    });
  },

  fetchData: function() {
    const labels = [];
    const datasets = [];
    var datas = [];

    $.each(this._data.datasets, function(key, dataset) {
      dataset.data = [];
    });

    $.each(this._data.raw, (function(index, data) {
      labels.push(data[this._data.label]);

      $.each(this._data.datasets, function(key, dataset) {
        dataset.data.push(data[key] || 0);
      });

    }).bind(this));

    $.each(this._data.datasets, function(key, dataset) {
      datasets.push({
        label: dataset.label,
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeColor: dataset.color,
        pointColor: dataset.color,
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: dataset.color,
        data: dataset.data
      });

      datas = datas.concat(dataset.data);
    });

    this._minValue = Math.floor(Array.min(datas) / this._step) * this._step;
    this._maxValue = (Math.ceil(Array.max(datas) / this._step) * this._step) + this._step;

    return {
      labels: labels,
      datasets: datasets
    };
  },

  getLegend: function(config) {
    const legend = $('<div class="legend"></div>');

    $(legend).append($('<i class="fa fa-minus fa-2x"></i>'))
      .append($('<label class="label">' + config.label + '</label>'))
      .css({
        'color': config.color
      });

    return legend;
  },

  cache: function(enable) {
    return (enable) ? '' : ('?_=' + new Date().valueOf());
  }
}

//--------------

Number.withCommas = function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Array.min = function(array) {
  return Math.min.apply(Math, array);
}
Array.max = function(array) {
  return Math.max.apply(Math, array);
}

//--------------

$().ready(function() {
  const lineChart = new LineChart({
    datalink: './data/birthintaiwan.json'
  });

  lineChart.render($('#content'));
});
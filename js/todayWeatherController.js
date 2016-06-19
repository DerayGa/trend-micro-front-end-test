function Weather() {

  this.init();
}

Weather.prototype = {
  _appid: 'd3f08813f2f20d19f75eedea0b64e1b3',
  _api: 'http://api.openweathermap.org/data/2.5/weather?q={Q}&units=metric&appid={APPID}',
  _unit: '°C', //'°F'
  _tempString: '{MIN}{U} ~ {MAX}{U}',
  _humidityString: '{HUM}%',
  _icons: ['cloud', 'rain', 'clear'],

  init: function() {
    this.dom = {};
    this.dom.root = document.createElement('div');
    this.dom.error = $('<div class="error"><i class="fa fa-close"></i><label></label></div>');
    this.dom.condition = $('<div class="condition"></div>');

    this.dom.city = $('<div class="city">City:</div>');
    this.dom.country = $('<div class="country">Country:</div>');
    this.dom.cityInput = $('<input id="city" type="text" value="Taipei"></input>');
    this.dom.countryInput = $('<input id="country" type="text" value="TW"></input>');
    this.dom.search = $('<button id="search"><i class="fa fa-search"></i><label>Search</label></button>');
    this.dom.report = $('<div class="report"></div>');
    this.dom.loading = $('<div class="fa fa-hourglass-half fa-5x loading"></div>');

    this.dom.weatherIcon = $('<div class="weather_icon"></div>');
    this.dom.weatherStatus = $('<div class="weather_status">' +
      '<div class="status"></div><div class="desc"></div></div>');
    this.dom.weatherDetail = $('<div class="weather_detail">' +
      '<div class="temperature">Temperature:</div><div class="temperature_value"></div>' +
      '<div class="humidity">Humidity:</div><div class="humidity_value"></div></div>');

    $(this.dom.root).addClass('weather')
      .append([this.dom.error, this.dom.condition, this.dom.report, this.dom.loading]);

    $(this.dom.condition).append([this.dom.city, this.dom.cityInput, this.dom.country
      , this.dom.countryInput, this.dom.search])

    $(this.dom.report).append([this.dom.weatherIcon, this.dom.weatherStatus, this.dom.weatherDetail]);

    $(this.dom.search).click(this.search.bind(this));

    $(this.dom.error).hide();
    $(this.dom.loading).hide();
    $(this.dom.report).hide();
  },

  rotate: function(angle, duration) {
    angle = angle || 360;
    duration = duration || 1500;

    $({
      deg: 0
    }).animate({
      deg: angle
    }, {
      duration: duration,
      step: (function(now) {
        $(this.dom.loading).css({
          transform: 'rotate(' + now + 'deg)'
        });
      }).bind(this),
      complete: (function() {
        $(this.dom.loading).css({
          transform: 'rotate(0deg)'
        });
        //enable if you need infinity loop of rotate
        //if ($(this.dom.loading).is(":visible")) {
        //  this.rotate((angle === 0) ? 360 : 0);
        //}
      }).bind(this)
    });
  },

  render: function(parent) {
    $(parent).append($(this.dom.root));
  },

  search: function() {
    $(this.dom.report).fadeOut();
    $(this.dom.loading).fadeIn();
    this.rotate();
    $(this.dom.error).hide();

    const api = this._api.replace('{Q}', this.getLocationString())
      .replace('{APPID}', this._appid);

    $.ajax({
      url: api,
      dataType: 'json',
      success: (function(data) {
        this._data = data;
        //settimeout to see loading effect
        window.setTimeout(this.parse.bind(this), 750)
        //this.parse();
      }).bind(this),
      error: (function(data) {
        console.log(data)
        this._data = (data.responseText)
          ? JSON.parse(data.responseText)
          : null;
        //settimeout to see loading effect
        window.setTimeout(this.parse.bind(this), 750)
        //this.parse();
      }).bind(this)
    });
  },

  parse: function() {
    if (!this._data || this._data.message) {
      this.onError();
      return;
    }

    $(this.dom.loading).fadeOut();

    const weather = this._data.weather[0];

    const temperature = this._tempString.replaceAll('{U}', this._unit)
      .replace('{MIN}', this._data.main.temp_min)
      .replace('{MAX}', this._data.main.temp_max);

    const humidity = this._humidityString.replace('{HUM}', this._data.main.humidity);
    var icon = '';

    $.each(this._icons, function(index, value) {
      if (weather.main.toLowerCase().indexOf(value) >= 0) {
        icon = value;
        return false;
      }
    });
    $(this.dom.weatherIcon).removeClass(this._icons.join(' '));
    $(this.dom.weatherIcon).addClass(icon);

    $('.status', this.dom.weatherStatus).html(weather.main);
    $('.desc', this.dom.weatherStatus).html(weather.description);
    $('.temperature_value', this.dom.weatherDetail).html(temperature);
    $('.humidity_value', this.dom.weatherDetail).html(humidity);

    $(this.dom.report).fadeIn();
  },

  getLocationString: function() {
    return $(this.dom.cityInput).val() + ',' + $(this.dom.countryInput).val();
  },

  onError: function() {
    var message = 'Unknown error';
    if (this._data) {
      message = this._data.message || 'Unknown error';
    }

    $('label', this.dom.error).html(message);
    $(this.dom.error).fadeIn();
    $(this.dom.report).fadeOut();
    $(this.dom.loading).fadeOut();
  },
}

//--------------

String.prototype.replaceAll = function(search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

//--------------

$().ready(function() {
  const weather = new Weather();

  weather.render($('#content'));
  weather.search();
});
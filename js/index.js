function Exam() {
  this.init();
}

Exam.prototype = {
  _li: null,
  _content: null,
  _templates: null,

  init: function() {
    this._templates = {};

    const pages = [{
      name: 'todayWeather',
      html: 'todayWeather.html',
      css: 'todayWeatherStyle.css',
      js: 'todayWeatherController.js'
    }, {
      name: 'dataAnalysis',
      html: 'dataAnalysis.html',
      css: 'dataAnalysisStyle.css',
      js: 'dataAnalysisController.js'
    }];

    $.each(pages, (function(index, page) {
      this._templates[page.name] = new Template(page);
    }).bind(this));

    this._li = $('body div ul li');
    this._content = $('#content');

    this.bindClickEvent();
  },

  bindClickEvent: function() {
    $.each($(this._li), function(index, item) {
      item.id = $(item).attr('id');
    });

    $(this._li).bind("click", (function(evt) {
      this.handleItemClicked(evt.delegateTarget);
    }).bind(this));
  },

  handleItemClicked: function(item) {
    $.each(this._li, (function(index, li) {
      if ($(li).hasClass('selected')) {
        $(li).removeClass('selected');

        if (this._templates[li.id]) {
          this._templates[li.id].unrender();
        }

        if (item == li) {
          item = null;
        }

        return false;
      }
    }).bind(this));

    if (!item) {
      return;
    }

    $(item).addClass('selected');
    if (this._templates[item.id]) {
      this._templates[item.id].render(this._content);
    }
  }
};

//----------------

function Template(config) {
  this.config = config;
}

Template.prototype = {
  config: null,
  css: null,
  js: null,
  path: {
    html: './template/',
    css: './css/',
    js: './js/'
  },

  cache: function(enable) {
    return (enable) ? '' : ("?_=" + new Date().valueOf());
  },

  render: function(parent) {
    this._parent = parent;

    this.css = $("<link rel='stylesheet' type='text/css' href='" +
      this.path.css + this.config.css + this.cache() + "'>");

    this.css[0].onload = (function() {
      this.css[0].onload = null;

      $.ajax({
        url: this.path.html + this.config.html + this.cache(),
        success: (function(data) {
          $(this._parent).addClass(this.config.name).append($(data));

          this.js = $("<script type='text/javascript' src='" +
            this.path.js + this.config.js + this.cache() + "'>");

          $('head').append(this.js);
        }).bind(this)
      });

    }).bind(this);

    $('head').append(this.css);
  },

  unrender: function() {
    $(this._parent).empty().removeClass(this.config.name);
    $(this.css).remove();
    $(this.js).remove();
  }
}

//----------------

$().ready(function() {
  const exam = new Exam();
});
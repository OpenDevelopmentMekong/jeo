(function($) {

 jeo.filterLayers = L.Control.extend({

  options: {
   position: 'bottomleft'
  },

  onAdd: function(map) {

   if(!this._map.conf.filteringLayers || this._map.conf.disableInteraction)
    return false;

   var self = this;

   this._map = map;

   this._map.filterLayers = this;

   this._container = L.DomUtil.create('div', 'jeo-filter-layers');

   this._$ = $(this._container);

   this._layers = map.conf.filteringLayers;

   this._swapWidget;
   this._switchWidget;

   this._layers.status = [];
   _.each(this._map.conf.layers, function(layer) {
    self._layers.status.push({
     ID: layer.ID,
     content: layer.post_content,
     excerpt: layer.excerpt,
     legend: layer.legend,
     download: layer.download_url,
     on: true
    });
   });

   this._build();

   return this._container;

  },

  _build: function() {

   var self = this;

   /*
    * Swapables
    */
   if(this._layers.swapLayers && this._layers.swapLayers.length >= 2) {
    var swap = this._layers.swapLayers;
    var list = '';
    _.each(swap, function(layer) {
     var attrs = '';
     if(layer.first)
      attrs = 'class="active"';
     else
      self._disableLayer(layer.ID);

      var status = self._getStatus(layer.ID).on ? " active" : "";
      list += '<li class="layer-item" data-layer="' + layer.ID + '" ' + attrs + '>';
      list += '<div class="layer-status'+status+'"/><h2 class="'+status+'">' + layer.title + '</h2>';
      if (layer.download)
       list += '<a class="download-url" target="_blank" href="'+layer.download+'">Download</a>';
      list += '<a class="toggle-info" alt="Info" href="#"><svg class="icon-info" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512"><path class="icon-info-path" d="M224 152c0-13.2 10.8-24 24-24h16c13.2 0 24 10.8 24 24v16c0 13.2-10.8 24-24 24h-16c-13.2 0-24-10.8-24-24v-16z"></path><path class="icon-info-path" d="M320 384h-128v-32h32v-96h-32v-32h96v128h32z"></path><path class="icon-info-path" d="M256 0c-141.385 0-256 114.615-256 256s114.615 256 256 256 256-114.615 256-256-114.615-256-256-256zM256 464c-114.875 0-208-93.125-208-208s93.125-208 208-208 208 93.125 208 208-93.125 208-208 208z"></path></svg></a>';
      list += '<div class="toggles">'
      // if (layer.content.length != layer.excerpt.length)
      //  list += '<a class="toggle-text" alt="More" href="#">More</a>';
      if (layer.legend)
       list += '<a class="toggle-legend" href="#">Show legend</a>';
      list += '</div>'
      if (layer.legend)
       list += '<div class="legend">'+layer.legend+'</div>'
      list += '<div class="layer-excerpt">'+ layer.excerpt +'</div>';
      list += '<div class="layer-content">'+ layer.content +'</div>';
      list += '<div class="clearfix"></div>'
      list += '</li>';
    });

    this._swapWidget = '<ul class="swap-layers">' + list + '</ul>';
    this._$.append(this._swapWidget);

    this._$.on('click', '.swap-layers li', function() {
      self._swapLayer($(this).data('layer'));
    });
   }

   /*
    * Switchables
    */
   if(this._layers.switchLayers && this._layers.switchLayers.length) {
    var switchable = this._layers.switchLayers;
    var list = '';
    _.each(switchable, function(layer) {
     var attrs = 'class="active"';
     if(layer.hidden) {
      attrs = '';
      self._disableLayer(layer.ID);
     }else{
      self._enableLayer(layer.ID);
     }

     var status = self._getStatus(layer.ID).on ? " active" : "";
     list += '<li class="layer-item" data-layer="' + layer.ID + '" ' + attrs + '>';
     list += '<div class="layer-status'+status+'"/><h2 class="'+status+'">' + layer.title + '</h2>';
     if (layer.download)
      list += '<a class="download-url" target="_blank" href="'+layer.download+'">Download</a>';
     list += '<a class="toggle-info" alt="Info" href="#"><svg class="icon-info" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512"><path class="icon-info-path" d="M224 152c0-13.2 10.8-24 24-24h16c13.2 0 24 10.8 24 24v16c0 13.2-10.8 24-24 24h-16c-13.2 0-24-10.8-24-24v-16z"></path><path class="icon-info-path" d="M320 384h-128v-32h32v-96h-32v-32h96v128h32z"></path><path class="icon-info-path" d="M256 0c-141.385 0-256 114.615-256 256s114.615 256 256 256 256-114.615 256-256-114.615-256-256-256zM256 464c-114.875 0-208-93.125-208-208s93.125-208 208-208 208 93.125 208 208-93.125 208-208 208z"></path></svg></a>';
     list += '<div class="toggles">'
    //  if (layer.content.length != layer.excerpt.length)
    //    list += '<a class="toggle-text" alt="More" href="#">More</a>';
     if (layer.legend)
      list += '<a class="toggle-legend" href="#">Show legend</a>';
     list += '</div>'
     if (layer.legend)
      list += '<div class="legend">'+layer.legend+'</div>'
     list += '<div class="layer-excerpt">'+ layer.excerpt +'</div>';
     list += '<div class="layer-content">'+ layer.content +'</div>';
     list += '<div class="clearfix"></div>'
     list += '</li>';
    });

    this._switchWidget = '<ul class="switch-layers">' + list + '</ul>';
    this._$.append(this._switchWidget);

    this._$.on('click', '.switch-layers li', function() {
     self._switchLayer($(this).data('layer'));
    });

   }

   this._update();

   return this._container;

  },

  _switchLayer: function(layer) {

   if(this._getStatus(layer).on) {

    this._disableLayer(layer);
    this._$.find('li[data-layer="' + layer + '"]').removeClass('active');

   } else {

    this._enableLayer(layer);
    this._$.find('li[data-layer="' + layer + '"]').addClass('active');

   }

   this._update();

  },

  _swapLayer: function(layer) {

   var self = this;

   if(this._getStatus(layer).on)
    return;

   _.each(this._layers.swapLayers, function(swapLayer) {

    if(swapLayer.ID == layer) {

     self._enableLayer(layer);

     self._$.find('li[data-layer="' + layer + '"]').addClass('active');

    } else {

     if(self._getStatus(swapLayer.ID).on) {

      self._disableLayer(swapLayer.ID);

      self._$.find('li[data-layer="' + swapLayer.ID + '"]').removeClass('active');

     }

    }
   });
   this._update();

  },

  _disableLayer: function(layer) {

   this._layers.status[this._getStatusIndex(layer)] = {
    ID: layer,
    on: false
   };

  },

  _enableLayer: function(layer) {

   this._layers.status[this._getStatusIndex(layer)] = {
    ID: layer,
    on: true
   };

  },

  _update: function() {

   this._map.$.find('.map-tooltip').hide();
   jeo.loadLayers(this._map, jeo.parseLayers(this._map, this._getActiveLayers()));

  },

  _getStatus: function(layer) {
   return _.find(this._layers.status, function(l) { return layer == l.ID; });
  },

  _getStatusIndex: function(layer) {

   var index;
   _.each(this._layers.status, function(l, i) {
    if(layer == l.ID)
     index = i;
   });
   return index;

  },

  _getActiveLayers: function() {
   var self = this;
   var activeLayers = [];
   _.each(this._layers.status, function(layer) {
    if(layer.on) {
     var actualLayer = _.find(self._map.conf.layers, function(l) { return l.ID == layer.ID; });
     activeLayers.push(actualLayer);
    }
   });
   return activeLayers;
  }

 });

})(jQuery);

const MapLeaflet = function (div) {
  this.arrayElement = [];
  this.map = new LMap(div);

  this.getArrayElement = function () {
    return this.arrayElement;
  };

  this.addElement = function (element) {
    this.arrayElement.push(element);
  };

  this.removeElement = function (element) {
    let find = false;
    let i;
    for (i = 0; i < this.arrayElement.length; i++) {
      if (this.arrayElement[i].egal(element)) {
        find = true;
        break;
      }
    }
    if (find === true) {
      this.arrayElement.splice(i, 1);
    }
  };

  this.removeElementAt = function (indice) {
    this.arrayElement.splice(indice, 1);
  };

  this.removeAllElement = function () {
    this.arrayElement.splice(0, this.arrayElement.length);
  };

  this.clearAll = function () {
    this.map.clearAllMarker();
  };

  this.updateMap = function () {
    /*console.log("on tente un update");
    console.log("longueur : " + this.arrayElement.length);
    console.log(this.arrayElement);*/

    this.clearAll();
    for (let i = 0; i < this.arrayElement.length; i++){
      this.map.addCircle(this.arrayElement[i]);
    }
  };

};

const MapElement = function (posX, posY, color, information) {
  this.posX = posX;
  this.posY = posY;
  this.color = color;
  this.information = information;

  this.toString = function () {
    return "posX= " + this.posX + "; posY= " + this.posY
      + "; color= " + this.color + "; fillColor= " + this.fillColor
      +  "; info= " + this.info;
  };

  this.egal = function (element) {
    return (this.posX === element.posX && this.posY === element.posY &&
      this.color === element.color);
  };
};

const LMap = function (div) {
  this.map = L.map(div).setView([46.3630104, 2.8846608], 6);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    + 'contributors'
  }).addTo(this.map);
  this.zones = new L.LayerGroup();
  this.map.addLayer(this.zones);

  this.addCircle = function (element) {
    var marker = L.circle([element.posX, element.posY], 10, {
      'stroke': false,
      'fill': true,
      'fillColor': element.color,
      'fillOpacity': 0.7,
    }).addTo(this.zones);
    marker.bindPopup(''); // Je ne mets pas de texte par défaut
    var mapopup = marker.getPopup();
    mapopup.setContent(element.information); // je personnalise un peu avant
                                             // d'afficher
  };

  this.clearAllMarker = function () {
    this.zones.clearLayers();
  };
};

module.exports = {MapLeaflet, MapElement};

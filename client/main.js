import {Session} from "meteor/session";

global.Buffer = global.Buffer || require("buffer").Buffer;

import {Template} from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import {MapLeaflet, MapElement} from '../myLib/MapLeaflet';

import './main.html';
//import {Session} from 'meteor/session';

import {Meteor} from 'meteor/meteor';

var mapLeaflet;

const getInfo = (response, row) => {
  let info = "";
  for (const j in response.rows[row]) {
    if (j != 'id' && j != 'photo') {
      //console.log(j);
      //console.log(response.rows[row][j]);
      if (j === 'heure_enr') {
        info += j + ": " + response.rows[row][j].hour + ":" +
          response.rows[row][j].minute + response.rows[row][j].second +
          "\n";
      }
      if (j === 'date_enr') {
        info += j + ": " + response.rows[row][j].date + "\n";
      } else {
        info += j + ": " + response.rows[row][j] + "\n";
      }
    }
  }
  return info;
};

const refreshSelection = function () {
  let cqlTab = Session.get('cqlTab') || [];
  let colorTab = Session.get('colorTab') || [];
  let selection = Session.get('selection');
  let i = 0;
  mapLeaflet.removeAllElement();
  cqlTab.forEach(function (cql) {
    let requete = "" + cql + selection + " ALLOW FILTERING;";

    Meteor.call('execCQL', requete, function (err, response) {
      if (err) {
        console.log(err);
      }
      else {
        for (const row in response.rows) {

          let info = getInfo(response, row);
          console.log(info);
          mapLeaflet.addElement(
            new MapElement(response.rows[row]['gps_lat'],
              response.rows[row]['gps_long'], colorTab[i], info));
        }
        console.log(i);
        i++;
      }
    });
  });
  const time = setInterval(() => {
    if ((i === cqlTab.length)) {
      clearInterval(time);
      console.log(mapLeaflet.getArrayElement());
      mapLeaflet.updateMap();
      console.log("===========   REFRESH   ===========");
    }
  }, 10);
};

Template.mapLeafletVisual.rendered = function () {
  mapLeaflet = new MapLeaflet('basicMap');
};

Template.biotopeSelection.events = {
  'click .environment': function (event) {
    let cqlTab = Session.get('cqlTab') || [];
    let colorTab = Session.get('colorTab') || [];
    let selection = Session.get('selection') || "";

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');

    let data = $('div[data-name="' + name_item + '"] input');
    for (let i = 0; i < data.length; i++) {

      if (document.getElementById(id_item).checked) {
        data[i].checked = true;
        if (data[i].className === 'habitat') {
          cqlTab.push("SELECT * from databio.habitat where typeHab = $$" +
            data[i].name + "$$");
          colorTab.push(data[i].value);
          Meteor.call(
            'execCQL', "SELECT * from databio.habitat where typeHab = $$" +
            data[i].name + "$$" + selection + " ALLOW FILTERING;",
            (err, response) => {
              if (err) {
                console.log(err);
              }
              else {
                for (const row in response.rows) {
                  let info = getInfo(response, row);
                  //console.log(info + "\n");

                  mapLeaflet.addElement(
                    new MapElement(response.rows[row]['gps_lat'],
                      response.rows[row]['gps_long'], data[i].value, info));
                  mapLeaflet.updateMap();
                }
              }
            });
        }
        else {
          cqlTab.push("SELECT * from databio.element_remarquable where type = $$" +
            data[i].name + "$$");
          colorTab.push(data[i].value);
          Meteor.call(
            'execCQL', "SELECT * from databio.element_remarquable where type = $$" +
            data[i].name + "$$" + selection + " ALLOW FILTERING;",
            (err, response) => {
              if (err) {
                console.log(err);
              }
              else {
                for (const row in response.rows) {
                  let info = getInfo(response, row);
                  //console.log(info + "\n");

                  mapLeaflet.addElement(
                    new MapElement(response.rows[row]['gps_lat'],
                      response.rows[row]['gps_long'], data[i].value, info));
                  mapLeaflet.updateMap();
                }

              }
            });
        }
      }
      else {
        data[i].checked = false;
        if (data[i].className === 'habitat') {
          colorTab.splice(
            cqlTab.indexOf("SELECT * from databio.habitat where typeHab = $$" +
              data[i].name + "$$"), 1);
          cqlTab.splice(
            cqlTab.indexOf("SELECT * from databio.habitat where typeHab = $$" +
              data[i].name + "$$"), 1);
          Meteor.call(
            'execCQL', "SELECT * from databio.habitat where typeHab = $$" +
            data[i].name + "$$" + selection + " ALLOW FILTERING;",
            (err, response) => {
              if (err) {
                console.log(err);
              }
              else {
                for (const row in response.rows) {
                  let info = getInfo(response, row);
                  //console.log(info + "\n");
                  cqlTab.push("SELECT * from databio.habitat where typeHab = $$" +
                    data[i].name + "$$");

                  mapLeaflet.removeElement(
                    new MapElement(response.rows[row]['gps_lat'],
                      response.rows[row]['gps_long'], data[i].value, info));
                  mapLeaflet.updateMap();
                }
              }
            });
        }
        else {
          colorTab.splice(
            cqlTab.indexOf("SELECT * from databio.element_remarquable where type = $$" +
              data[i].name + "$$"), 1);
          cqlTab.splice(
            cqlTab.indexOf("SELECT * from databio.element_remarquable where type = $$" +
              data[i].name + "$$"), 1);
          Meteor.call(
            'execCQL', "SELECT * from databio.element_remarquable where type = $$" +
            data[i].name + "$$" + selection + " ALLOW FILTERING;",
            (err, response) => {
              if (err) {
                console.log(err);
              }
              else {
                for (const row in response.rows) {
                  let info = getInfo(response, row);
                  mapLeaflet.removeElement(
                    new MapElement(response.rows[row]['gps_lat'],
                      response.rows[row]['gps_long'], data[i].value, info));
                  mapLeaflet.updateMap();
                }
              }
            });
        }
      }
    }

    console.log(cqlTab);
    console.log(colorTab);
    console.log("selection : " + selection);
    Session.set('cqlTab', cqlTab);
    Session.set('colorTab', colorTab);
    Session.set('selection', selection);
  },

  'click .habitat': function (event) {
    let cqlTab = Session.get('cqlTab') || [];
    let colorTab = Session.get('colorTab') || [];
    let selection = Session.get('selection') || "";

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    let color = $(event.target).attr('value');
    if (document.getElementById(id_item).checked) {
      cqlTab.push("SELECT * from databio.habitat where typeHab = $$" +
        name_item + "$$");
      colorTab.push(color);
    }
    else {
      colorTab.splice(
        cqlTab.indexOf("SELECT * from databio.habitat where typeHab = $$" +
          name_item + "$$"), 1);
      cqlTab.splice(
        cqlTab.indexOf("SELECT * from databio.habitat where typeHab = $$" +
          name_item + "$$"), 1);
    }

    Meteor.call('execCQL', "SELECT * from databio.habitat where typeHab = $$" +
      name_item + "$$" + selection + " ALLOW FILTERING;", (err, response) => {
      if (err) {
        console.log(err);
      }
      else {
        for (const row in response.rows) {
          let info = getInfo(response, row);
          //console.log(info + "\n");
          if (document.getElementById(id_item).checked) {
            mapLeaflet.addElement(
              new MapElement(response.rows[row]['gps_lat'],
                response.rows[row]['gps_long'], color, info));
            mapLeaflet.updateMap();
          }
          else {

            for (const row in response.rows) {
              mapLeaflet.removeElement(
                new MapElement(response.rows[row]['gps_lat'],
                  response.rows[row]['gps_long'], color, info));
              mapLeaflet.updateMap();
            }
          }
        }

      }
    });
    console.log(cqlTab);
    console.log(colorTab);
    console.log("selection : " + selection);
    Session.set('cqlTab', cqlTab);
    Session.set('colorTab', colorTab);
    Session.set('selection', selection);
  },

  'click .element_remarquable': function (event) {
    let cqlTab = Session.get('cqlTab') || [];
    let colorTab = Session.get('colorTab') || [];
    let selection = Session.get('selection') || "";

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    let color = $(event.target).attr('value');
    if (document.getElementById(id_item).checked) {
      cqlTab.push("SELECT * from databio.element_remarquable where type = $$" +
        name_item + "$$");
      colorTab.push(color);
    }
    else {
      colorTab.splice(
        cqlTab.indexOf("SELECT * from databio.element_remarquable where type = $$" +
          name_item + "$$"), 1);
      cqlTab.splice(
        cqlTab.indexOf("SELECT * from databio.element_remarquable where type = $$" +
          name_item + "$$"), 1);
    }
    Meteor.call(
      'execCQL', "SELECT * from databio.element_remarquable where type = $$" +
      name_item + "$$" + selection + " ALLOW FILTERING;", (err, response) => {
        if (err) {
          console.log(err);
        }
        else {
          for (const row in response.rows) {
            let info = getInfo(response, row);
            console.log(info + "\n");
            if (document.getElementById(id_item).checked) {
              mapLeaflet.addElement(
                new MapElement(response.rows[row]['gps_lat'],
                  response.rows[row]['gps_long'], color, info));
              mapLeaflet.updateMap();
            }
            else {
              for (const row in response.rows) {
                mapLeaflet.removeElement(
                  new MapElement(response.rows[row]['gps_lat'],
                    response.rows[row]['gps_long'], color, info));
                mapLeaflet.updateMap();
              }
            }
          }

        }
      });
    console.log(cqlTab);
    console.log(colorTab);
    console.log("selection : " + selection);
    Session.set('cqlTab', cqlTab);
    Session.set('colorTab', colorTab);
    Session.set('selection', selection);
  },

  'click .element_invasif': function (event) {
    let cqlTab = Session.get('cqlTab') || [];
    let colorTab = Session.get('colorTab') || [];
    let selection = Session.get('selection') || "";

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    let color = $(event.target).attr('value');
    if (document.getElementById(id_item).checked) {
      cqlTab.push("SELECT * from databio.element_invasif where type = $$" +
        name_item + "$$");
      colorTab.push(color);
    }
    else {
      colorTab.splice(
        cqlTab.indexOf("SELECT * from databio.element_invasif where type = $$" +
          name_item + "$$"), 1);
      cqlTab.splice(
        cqlTab.indexOf("SELECT * from databio.element_invasif where type = $$" +
          name_item + "$$"), 1);
    }
    Meteor.call(
      'execCQL', "SELECT * from databio.element_invasif where type = $$" +
      name_item + "$$" + selection + " ALLOW FILTERING;", (err, response) => {
        if (err) {
          console.log(err);
        }
        else {
          for (const row in response.rows) {
            let info = getInfo(response, row);
            console.log(info + "\n");
            if (document.getElementById(id_item).checked) {
              mapLeaflet.addElement(
                new MapElement(response.rows[row]['gps_lat'],
                  response.rows[row]['gps_long'], color, info));
              mapLeaflet.updateMap();
            }
            else {
              for (const row in response.rows) {
                mapLeaflet.removeElement(
                  new MapElement(response.rows[row]['gps_lat'],
                    response.rows[row]['gps_long'], color, info));
                mapLeaflet.updateMap();
              }
            }
          }

        }
      });
    console.log(cqlTab);
    console.log(colorTab);
    console.log("selection : " + selection);
    Session.set('cqlTab', cqlTab);
    Session.set('colorTab', colorTab);
    Session.set('selection', selection);
  },
};

Template.dateSelection.events = {
  'click .date': function (event) {
    let selection = Session.get('selection') || "";
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    if (document.getElementById(id_item).checked === true) {
      switch (name_item) {
        case "startDate" :
          selection +=
            " and date_enr >= '" + document.getElementById("date1").value + "'";
          break;
        case "endDate" :
          selection +=
            " and date_enr <= '" + document.getElementById("date2").value + "'";
          break;
      }
    }
    else {
      switch (name_item) {
        case "startDate" :
          selection = selection.replace(selection.substring(
            selection.search(" and date_enr >= "), selection.search(
            " and date_enr >= ") + 29), "");
          break;
        case "endDate" :
          selection = selection.replace(selection.substring(
            selection.search(" and date_enr <= "), selection.search(
            " and date_enr <= ") + 29), "");
          break;
      }
    }

    console.log("selection= \"" + selection + "\"");
    Session.set('selection', selection);
    refreshSelection();
  }
};

Template.regionSelection.events = {
  'click input': function (event) {
    let selection = Session.get('selection') || "";
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    console.log("id : " + id_item + "; name = " + name_item);
    if (document.getElementById(id_item).checked === true) {
      selection += " and region = $$" + name_item + "$$";
    }
    else {
      selection = selection.replace(" and region = $$" + name_item + "$$", "");
    }

    console.log("selection= \"" + selection + "\"");
    Session.set('selection', selection);
    refreshSelection();
  }
};

Template.specieSelection.events = {
  'click input': function (event) {
    let cqlTab = Session.get('cqlTab') || [];
    let colorTab = Session.get('colorTab') || [];
    let selection = Session.get('selection') || "";

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    let color = $(event.target).attr('value');
    if (document.getElementById(id_item).checked) {
      cqlTab.push("SELECT * from databio.espece where nom_esp = $$" +
        name_item + "$$");
      colorTab.push(color);
    }
    else {
      colorTab.splice(
        cqlTab.indexOf("SELECT * from databio.espece where nom_esp = $$" +
          name_item + "$$"), 1);
      cqlTab.splice(
        cqlTab.indexOf("SELECT * from databio.espece where nom_esp = $$" +
          name_item + "$$"), 1);
    }
    Meteor.call(
      'execCQL', "SELECT * from databio.espece where nom_esp = $$" +
      name_item + "$$" + selection + " ALLOW FILTERING;", (err, response) => {
        if (err) {
          console.log(err);
        }
        else {
          for (const row in response.rows) {
            let info = getInfo(response, row);
            console.log(info + "\n");
            if (document.getElementById(id_item).checked) {
              mapLeaflet.addElement(
                new MapElement(response.rows[row]['gps_lat'],
                  response.rows[row]['gps_long'], color, info));
              mapLeaflet.updateMap();
            }
            else {
              for (const row in response.rows) {
                mapLeaflet.removeElement(
                  new MapElement(response.rows[row]['gps_lat'],
                    response.rows[row]['gps_long'], color, info));
                mapLeaflet.updateMap();
              }
            }
          }

        }
      });
    console.log(cqlTab);
    console.log(colorTab);
    console.log("selection : " + selection);
    Session.set('cqlTab', cqlTab);
    Session.set('colorTab', colorTab);
    Session.set('selection', selection);
  },
};

Template.exportData.events = {
  'click #exportFull': function () {

    console.log("Un petit test");

    let showquery_allRemarcable = "SELECT * FROM databio.element_remarquable;";

    let showquery_allHabitat = "SELECT * FROM databio.habitat;";

    let showquery_allEspece = "SELECT * FROM databio.espece;";

    let showquery_allInvasif = "SELECT * FROM databio.element_invasif;";

    Meteor.call('execCQL', showquery_allRemarcable, function (err, response) {

      let csv = 'nommilieu,typehab,date_enr,gps_lat,gps_lat_lam,gps_long,gps_long_lam,heure_enr,type\n';

      /*let date = new Date();
      console.log(date);
      let options = {year: 'numeric', month: 'short', day: '2-digit'};
      let resultDate = new Intl.DateTimeFormat('en-GB', options).format(date);*/

      for (let i = 0; i < response.rows.length; i++) {

        csv += "\"" + response.rows[i]['nomMilieu'] + "\","
          + response.rows[i]['typehab'] + ","
          + response.rows[i]['date_enr'].day + "-" +
          response.rows[i]['date_enr'].month + "-" +
          response.rows[i]['date_enr'].year + ","
          + response.rows[i]['gps_lat'] + ","
          + response.rows[i]['gps_lat_lam'] + ","
          + response.rows[i]['gps_long'] + ","
          + response.rows[i]['gps_long_lam'] + ","
          + response.rows[i]['heure_enr'].hour + ":" +
          response.rows[i]['heure_enr'].minute + ":" +
          response.rows[i]['heure_enr'].second + ","
          + response.rows[i]['type'] + "\n";
      }

      let hiddenElement = document.createElement('a');
      hiddenElement.href =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Element_remarquable.csv';
      hiddenElement.click();

    });

    Meteor.call('execCQL', showquery_allHabitat, function (err, response) {

      let csv = 'gps_lat,gps_lat_lam,gps_long,gps_long_lam,milieu,typehab\n';

      for (let i = 0; i < response.rows.length; i++) {

        csv += response.rows[i]['gps_lat'] + ","
          + response.rows[i]['gps_lat_lam'] + ","
          + response.rows[i]['gps_long'] + ","
          + response.rows[i]['gps_long_lam'] + ","
          + "\"" + response.rows[i]['milieu'] + "\","
          + response.rows[i]['typehab'] + "\n";

      }

      let hiddenElement = document.createElement('a');
      hiddenElement.href =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Habitat.csv';
      hiddenElement.click();

    });

    Meteor.call('execCQL', showquery_allEspece, function (err, response) {

      let csv = 'gps_lat,gps_lat_lam,gps_long,gps_long_lam,nom_esp\n';

      for (let i = 0; i < response.rows.length; i++) {

        csv += response.rows[i]['gps_lat'] + ","
          + response.rows[i]['gps_lat_lam'] + ","
          + response.rows[i]['gps_long'] + ","
          + response.rows[i]['gps_long_lam'] + ","
          + "\"" + response.rows[i]['nom_esp'] + "\"," + "\n";

      }

      let hiddenElement = document.createElement('a');
      hiddenElement.href =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Espece.csv';
      hiddenElement.click();

    });

    Meteor.call('execCQL', showquery_allInvasif, function (err, response) {

      let csv = 'gps_lat,gps_lat_lam,gps_long,gps_long_lam,type\n';

      for (let i = 0; i < response.rows.length; i++) {

        csv += response.rows[i]['gps_lat'] + ","
          + response.rows[i]['gps_lat_lam'] + ","
          + response.rows[i]['gps_long'] + ","
          + response.rows[i]['gps_long_lam'] + ","
          + "\"" + response.rows[i]['type'] + "\"," + "\n";

      }

      let hiddenElement = document.createElement('a');
      hiddenElement.href =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Element_invasif.csv';
      hiddenElement.click();

    });
  },

  'click #exportSession': function () {

    let cqlTab = Session.get('cqlTab') || [];
    let selection = Session.get('selection') || "";
    let csvHabitat = 'milieu, typeHab, GPS_lat, GPS_long, GPS_lat_lam, GPS_long_lam, date_enr, heure_enr, region\n';
    let csvElemRemarquable = 'nomMilieu, typeHab, type, GPS_lat, GPS_long, GPS_lat_lam, GPS_long_lam, date_enr, heure_enr, region\n';
    let csvElemInvasif = 'type, GPS_lat, GPS_long, GPS_lat_lam, GPS_long_lam, date_enr, heure_enr, region\n';
    let csvEspece = 'nom_esp, GPS_lat, GPS_long, GPS_lat_lam, GPS_long_lam, date_enr, heure_enr, region\n';
    let cqlCounter = 0;
    Session.set('rows', "nothing");
    console.log("cqlTab.length: " + cqlTab.length);
    for (let i = 0; i < cqlTab.length; i++) {
      if (cqlTab[i].search("databio.habitat") > 0) {
        console.log("databio.habitat");
        Meteor.call('execCQL', cqlTab[i] + selection + " ALLOW FILTERING;",
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              for (const row in result.rows) {
                csvHabitat += "\""
                  + result.rows[row]['milieu'] + "\",\""
                  + result.rows[row]['typehab'] + "\","
                  + result.rows[row]['gps_lat'] + ","
                  + result.rows[row]['gps_long'] + ","
                  + result.rows[row]['gps_lat_lam'] + ","
                  + result.rows[row]['gps_long_lam'] + ","
                  + result.rows[row]['date_enr'].day + "-" +
                  result.rows[row]['date_enr'].month + "-" +
                  result.rows[row]['date_enr'].year + ","
                  + result.rows[row]['heure_enr'].hour + ":" +
                  result.rows[row]['heure_enr'].minute + ":" +
                  result.rows[row]['heure_enr'].second + ",\""
                  + result.rows[row]['region'] + "\"\n";
              }
              cqlCounter++;
            }
          });
      }
      if (cqlTab[i].search("databio.element_remarquable") > 0) {
        console.log("databio.element_remarquable");
        Meteor.call('execCQL', cqlTab[i] + selection + " ALLOW FILTERING;",
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              for (const row in result.rows) {
                csvElemRemarquable += "\""
                  + result.rows[row]['nomMilieu'] + "\",\""
                  + result.rows[row]['typeHab'] + "\",\""
                  + result.rows[row]['type'] + "\","
                  + result.rows[row]['gps_lat'] + ","
                  + result.rows[row]['gps_long'] + ","
                  + result.rows[row]['gps_lat_lam'] + ","
                  + result.rows[row]['gps_long_lam'] + ","
                  + result.rows[row]['date_enr'].day + "-" +
                  result.rows[row]['date_enr'].month + "-" +
                  result.rows[row]['date_enr'].year + ","
                  + result.rows[row]['heure_enr'].hour + ":" +
                  result.rows[row]['heure_enr'].minute + ":" +
                  result.rows[row]['heure_enr'].second + ",\""
                  + result.rows[row]['region'] + "\"\n";
              }
              cqlCounter++;
            }
          });

      }
      if (cqlTab[i].search("databio.element_invasif") > 0) {
        console.log("databio.element_invasif");
        Meteor.call('execCQL', cqlTab[i] + selection + " ALLOW FILTERING;",
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              for (const row in result.rows) {
                csvElemInvasif += "\""
                  + result.rows[row]['type'] + "\","
                  + result.rows[row]['gps_lat'] + ","
                  + result.rows[row]['gps_long'] + ","
                  + result.rows[row]['gps_lat_lam'] + ","
                  + result.rows[row]['gps_long_lam'] + ","
                  + result.rows[row]['date_enr'].day + "-" +
                  result.rows[row]['date_enr'].month + "-" +
                  result.rows[row]['date_enr'].year + ","
                  + result.rows[row]['heure_enr'].hour + ":" +
                  result.rows[row]['heure_enr'].minute + ":" +
                  result.rows[row]['heure_enr'].second + ",\""
                  + result.rows[row]['region'] + "\"\n";
              }
              cqlCounter++;
            }
          });
      }
      if (cqlTab[i].search("databio.espece") > 0) {
        console.log("databio.espece");
        Meteor.call('execCQL', cqlTab[i] + selection + " ALLOW FILTERING;",
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              for (const row in result.rows) {
                csvEspece += "\""
                  + result.rows[row]['nom_esp'] + "\","
                  + result.rows[row]['gps_lat'] + ","
                  + result.rows[row]['gps_long'] + ","
                  + result.rows[row]['gps_lat_lam'] + ","
                  + result.rows[row]['gps_long_lam'] + ","
                  + result.rows[row]['date_enr'].day + "-" +
                  result.rows[row]['date_enr'].month + "-" +
                  result.rows[row]['date_enr'].year + ","
                  + result.rows[row]['heure_enr'].hour + ":" +
                  result.rows[row]['heure_enr'].minute + ":" +
                  result.rows[row]['heure_enr'].second + ",\""
                  + result.rows[row]['region'] + "\"\n";
              }
              cqlCounter++;
            }
          });
      }
      console.log("i: " + i);
    }
    const time = setInterval(() => {
      if (cqlCounter === cqlTab.length) {
        clearInterval(time);
        console.log("traitemeent final");
        console.log(csvHabitat);
        console.log(csvElemInvasif);
        console.log(csvElemRemarquable);
        console.log(csvEspece);
        let hiddenElementHabitat = document.createElement('a');
        hiddenElementHabitat.href =
          'data:text/csv;charset=utf-8,' + encodeURIComponent(csvHabitat);
        hiddenElementHabitat.target = '_blank';
        hiddenElementHabitat.download = 'Habitat_session.csv';
        hiddenElementHabitat.click();

        let hiddenElementElemRemarquable = document.createElement('a');
        hiddenElementElemRemarquable.href =
          'data:text/csv;charset=utf-8,' +
          encodeURIComponent(csvElemRemarquable);
        hiddenElementElemRemarquable.target = '_blank';
        hiddenElementElemRemarquable.download =
          'Element_remarquable_session.csv';
        hiddenElementElemRemarquable.click();

        let hiddenElementElemInvasif = document.createElement('a');
        hiddenElementElemInvasif.href =
          'data:text/csv;charset=utf-8,' + encodeURIComponent(csvElemInvasif);
        hiddenElementElemInvasif.target = '_blank';
        hiddenElementElemInvasif.download = 'Element_invasif_session.csv';
        hiddenElementElemInvasif.click();

        let hiddenElementEspece = document.createElement('a');
        hiddenElementEspece.href =
          'data:text/csv;charset=utf-8,' + encodeURIComponent(csvEspece);
        hiddenElementEspece.target = '_blank';
        hiddenElementEspece.download = 'Espece_session.csv';
        hiddenElementEspece.click();
      }
    }, 10);
  }
};

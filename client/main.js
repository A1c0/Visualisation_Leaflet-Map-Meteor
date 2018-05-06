import {Session} from "meteor/session";

global.Buffer = global.Buffer || require("buffer").Buffer;

import {Template} from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import {MapLeaflet, MapElement} from '../myLib/MapLeaflet';

import './main.html';
//import {Session} from 'meteor/session';
import {Meteor} from 'meteor/meteor';

let mapLeaflet;

Template.mapLeafletVisual.rendered = function () {
  mapLeaflet = new MapLeaflet('basicMap');
};

Template.biotopeSelection.events = {
  'click .environment' : function (event) {
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    data = $('div[data-name="' + name_item + '"] input');
    for (let i = 0; i < data.length; i++){
      if (document.getElementById(id_item).checked)
        data[i].checked = true;
      else
        data[i].checked = false;
    }
  },

  'click input': function (event) {
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    //let color = $(event.target).attr('value');
    /*
    let class_item = $(event.target).attr('class');
    console.log( "name : " + name_item + "; id : " + id_item + "; classe : " + class_item);
    let data;
    if (class_item === "environment"){
      data = $('div[data-name="' + name_item + '"] input');
      for (let i = 0; i < data.length; i++){
        if (document.getElementById(id_item).checked)
          data[i].checked = true;
        else
          data[i].checked = false;
      }
    }*/

    let selection = Session.get('selection') || "";
    /*
    for (let i = 1; i < 9; i++){
      let name = "environement" + i;
      data = $('div[data-name="' + name + '"] input');
      let change = true;
      for (let j = 0; j < data.length; j++){
        if (data[j].checked === false)
          change = false;
      }
      if (change){
        document.getElementById(name).checked = false;
        console.log("ccouchgdrf");
      }
    }*/

      mapLeaflet.removeAllElement();
    mapLeaflet.updateMap();
    //mise a jour de la carte en fonction de la selection

    console.log("selection : " + selection);
    data = $('div[id="Biotope"] input');
    for (let i = 0; i < data.length; i++){
      let cql = "";
      if (document.getElementById(data[i].id).checked === true){
        switch (data[i].className){
          /*case "environment" :
            cql = "SELECT * from databio.habitat where milieu = $$" + data[i].name + "$$;";
            //console.log(cql);
            break;*/
          case "habitat" :
            cql = "SELECT * from databio.habitat where typeHab = $$" + data[i].name + "$$" + selection + ";";
            //console.log(cql);
            break;
        }
      }
      if (cql !== ""){
        Meteor.call('execCQL', cql, function (err, response) {
          if (!err){
            //console.log(response);
            response.rows.forEach(function (row) {
              let info = 'milieu : ' + row['milieu'];
              mapLeaflet.addElement(new MapElement(row['gps_lat'], row['gps_long'], '#2b69ac', info));
            });
            mapLeaflet.updateMap();
          }
        });
      }
    }
    //mapLeaflet.updateMap();
  },

  'change input' : function (event) {
    console.log(event);

    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    console.log("la balise " + id_item + " a changé");
  }
};

Template.dateSelection.events = {
  'click .date': function(event) {
    let selection = Session.get('selection') || "";
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    if (document.getElementById(id_item).checked === true){
      switch (name_item){
        case "startDate" :
          selection += " and date_enr >= '" + document.getElementById("date1").value + "'";
          break;
        case "endDate" :
          selection += " and date_enr <= '" + document.getElementById("date2").value + "'";
          break;
      }
    }
    else {
      switch (name_item){
        case "startDate" :
          selection = selection.replace(selection.substring(selection.search(" and date_enr >= "), selection.search(" and date_enr >= ") + 29), "");
          break;
        case "endDate" :
          selection = selection.replace(selection.substring(selection.search(" and date_enr <= "), selection.search(" and date_enr <= ") + 29), "");
          break;
      }
    }

    console.log("selection= \"" + selection + "\"");
    Session.set('selection', selection);

  }
};

Template.regionSelection.events = {
  'click input': function(event) {
    let selection = Session.get('selection') || "";
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    console.log("id : " + id_item + "; name = " + name_item);
    if (document.getElementById(id_item).checked === true){
      selection += " and region = $$" + name_item + "$$";
    }
    else {
      selection = selection.replace(" and region = $$" + name_item + "$$", "");
    }

    console.log("selection= \"" + selection + "\"");
    Session.set('selection', selection);

  }
};

Template.specieSelection.events = {
  'click input' : function (event) {
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    console.log("id : " + id_item + "; name = " + name_item);
    let cql = "";
    if (document.getElementById(id_item).checked === true){
      cql = "SELECT * FROM "
    }
    else {
      selection = selection.replace(" and region = $$" + name_item + "$$", "");
    }
  }
};

Template.test1.events = {
  'click a ': function() {

    Meteor.call('execCQL', "SELECT * FROM sampledb.sarat ;", function (err, response) {
      Session.set('yolo', response);
    });

    let res = Session.get('yolo');
    console.log(res);
  }
};

Template.test2.events = {
  'click a ': function() {

    let test = "bonjour je suis un gentil garcon";
    console.log(test.replace(test.substring(test.search("suis"), test.search("suis") + 3), ""));
  }
};


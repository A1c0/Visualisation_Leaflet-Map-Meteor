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
  'click input': function (event) {
    let name_item = $(event.target).attr('name'); // recuperation du nom de la
    // checkbox
    let id_item = $(event.target).attr('id');
    //let color = $(event.target).attr('value');

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
    }
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

    let selection = "";
    data = $('div[id="Date"] input[class="date"]');
    for (let i = 0; i < data.length; i++){
      if (data[i].checked === true){
        switch (data[i].name){
          case "startDate" :
            selection += " and date_enr >= '" + document.getElementById("date1").value + "'";
            break;
          case "endDate" :
            selection += " and date_enr <= '" + document.getElementById("date2").value + "'";
            break;
        }
      }
    }

    data = $('div[id="Région"] input');
    for (let i = 0; i < data.length; i++){
      if (data[i].checked === true){
        selection += " and region = $$" + data[i].name + "$$";
      }
    }

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
  }
};
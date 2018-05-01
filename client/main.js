import {Session} from "meteor/session";

global.Buffer = global.Buffer || require("buffer").Buffer;

import {Template} from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import {MapLeaflet, MapElement} from '../myLib/MapLeaflet';

import './main.html';
//import {Session} from 'meteor/session';
import {Meteor} from 'meteor/meteor';

var mapLeaflet;

Template.mapLeafletVisual.rendered = function () {
  mapLeaflet = new MapLeaflet('basicMap');
};

Template.environmentSelection.events = {
  'click input': function (event) {
    let name = $(event.target).attr('name'); // recuperation du nom de la
                                             // checkbox
    let id = $(event.target).attr('id');
    let color = $(event.target).attr('value');

    let class_item = $(event.target).attr('class');
    console.log("classe : " + class_item);

    let cql = "SELECT * FROM databio.habitat WHERE milieu = '" + name + "';";
    console.log("cql : " + cql);

    if (document.getElementById(id).checked === true ) {
      console.log("c'est selectionné");
      Meteor.call('execCQL', cql, function (err, response) {
        console.log(response);

        response.rows.forEach(function (row) {
          let info = "milieu : " + row['milieu'];
          mapLeaflet.addElement(new MapElement(row['gps_lat'], row['gps_long'], color, info));
        });
        mapLeaflet.update();
      });
    }
    else {
      console.log("c'est deselectionné");
      Meteor.call('execCQL', cql, function (err, response) {
        console.log(response);

        response.rows.forEach(function (row) {
          let info = "milieu : " + row['milieu'];
          mapLeaflet.removeElement(new MapElement(row['gps_lat'], row['gps_long'], color, info));
        });
        mapLeaflet.update();
      });
    }

  }
};
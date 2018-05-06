import {Meteor} from 'meteor/meteor';

const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints: ['127.0.0.1:9042']});
var cassandraExecSync = Meteor.wrapAsync(client.execute, client);

Meteor.startup(() => {

  console.log("Hello Server");

  console.log('init done');

  client.connect(function (err) {
    console.log("cp" + err);
  });
});

Meteor.methods({
  foo(arg1) {
    return arg1;
  },

  execCQL(queryCQL) {
    console.log("Request : " + queryCQL);
    return cassandraExecSync(queryCQL);
  }
});
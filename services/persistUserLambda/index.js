
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const doc = require('dynamodb-doc');
const Dynamo = new doc.DynamoDB();

var USER_TABLE = 'Users';
var TEAM_TABLE = 'Teams'
var shortid

exports.handler = (event, context, cb) => {
  console.log(event);

  var params = {
    TableName: USER_TABLE
  };

  var teamParams = {
    TableName: TEAM_TABLE
  };

  if (event.request.userAttributes.email && event.request.userAttributes.givenName && event.request.userAttributes.familyName && event.request.userAttributes.teamName) {
    params.Key = {
      'email': {N: '001'}
    }

    Dynamo.getItem(params, (err, data) => {
      if (err) {
        cb(null, {statusCode: 400, msg: 'Error validating new user'})
      } else {
        if (data.Items) {
          cb(null, {statusCode: 400, msg: `User with email ${event.request.userAttributes.email} already exists.`});
        } else {
          teamParams.Key = {'teamName': teamName};
          var updatedTeam = {};
          Dynamo.getItem(teamParams, (tErr, tData) => {
            if (tErr) {
              cb(null, {statusCode: 400, msg: 'Error validating user team'})
            } else if (data.Item && data.Item.members) {
              updatedTeam = data.Item;
              updatedTeam.members.push(event.request.userAttributes.email);
            } else {
              updatedTeam = {teamName: event.request.userAttributes.teamName, type: 'default', members: [event.request.userAttributes.email]}
            }
            delete params.Key;
            params.Item = {
              email: event.request.userAttributes.email,
              firstName: event.request.userAttributes.givenName,
              lastname: event.request.userAttributes.familyName
            }
            Dynamo.putItem(params, (puErr, puData) => {
              if (pUerr) {
                cb(null, {statusCode: 401, msg: 'Error adding user to DB'});
              } else {
                delete teamParams.Key;
                teamParams.Item = updatedTeam;
                Dynamo.putItem(teamParams, (ptErr, ptData) => {
                  if (ptErr) {
                    cb(null, {statusCode: 400, msg: 'Error updating team data'});
                  } else {
                    cb(null, {statusCode: 200, msg: 'Successfully added user and updated corresponding team.'})
                  }
                });
              }
            });
          });
        }
      }
    });

  }

};

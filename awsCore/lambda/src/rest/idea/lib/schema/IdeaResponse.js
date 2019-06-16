
const shortid = require('shortid');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const Cognito = new AWS.CognitoIdentityServiceProvider();
const doc = require('dynamodb-doc');
const Dynamo = new doc.DynamoDB();

var TABLE = process.env.TABLE || 'Ideas';

module.exports = class Idea {
  constructor(tkn){
    this.tkn = tkn
  }

  async getUserInfo(){
    try {
      var cogUser = await Cognito.getUser({AccessToken: this.tkn}).promise();
      this.user = cogUser.UserAttributes.find(a => a.Name === 'email').Value;
      return new Promise(resolve => {resolve(this)});
    } catch(err) {
      return new Promise(resolve => {resolve(null)});
    }
  }

  getIdeas(idea){
    var params = {
      TableName: TABLE
    }
    if (idea === null) {
      return new Promise(resolve => {
        getByUser(this.user)
          .then(ideas => {
            resolve(ideas);
          }, err => {
            resolve({code: 400, msg: 'Error attempting to GET all ideas for user ' + this.user});
          });
      });
    } else {
      params.Key = {iId: idea, creator: this.user};
      return new Promise(resolve => {
        Dynamo.getItem(params, (err, data) => {
          if (err) {
            console.log(err)
            resolve({code: 400, msg : 'No data for item ' + idea});
          } else {
            resolve(data.Item);
          }
        });
      });
    }

  }

  async postNewIdea(body, type){

    if (body === null) {
      return new Promise(resolve => {resolve({code: 422, msg: 'Request body required to POST new idea'})});
    }

    var existingIdeas = await getByUser(this.user);
    if (existingIdeas.Items.length >= 12) {
      return new Promise(resolve => resolve({code: 400, msg: 'User already has MAXIMUM pending ideas.'}));
    } else {
      var template = createIdeaTemplate(this.user, body, type);
      return new Promise(resolve => {
        Dynamo.putItem({TableName: TABLE, Item: template}, (err, data) => {
          if (err) {
            resolve({code: 400, msg: 'Error attempting to POST new user'});
          } else {
            resolve('Successfully posted idea ' + template.iId);
          }
        });
      });
    }

  }

  async updateIdea(body, idea){
    // copying whole object for update
    if (idea === null) {
      return new Promise(resolve => {resolve({code: 403, msg: 'Idea id missing from path parameters'})});
    } else {
      var exists = await Dynamo.getItem({TableName: TABLE, Key: {iId: idea, creator: this.user}}).promise();
      var updated = exists.Item;
      updated.body = body;
        var params = {
          TableName: TABLE,
          Item: updated,
        };
        return new Promise(resolve => {
          Dynamo.putItem(params, (err, data) => {
            err
              ? resolve({code: 400, msg: 'Unable to UPDATE idea ' + idea})
              : resolve(body);
          });
        });
      }
  }

  deleteIdea(idea){
    var params = {
      TableName: TABLE,
      Key: {
        iId: idea,
        creator: this.user
      }
    };
    return new Promise(resolve => {
      Dynamo.deleteItem(params, (err, data) => {
        err
          ? resolve({code: 400, msg: 'Could not DELETE idea ' + idea})
          : resolve('Successfully deleted idea ' + idea);
      });
    });
  }

}

function createIdeaTemplate(email, body, type){
  return {
    iId: shortid.generate() + '-' + shortid.generate(),
    creator: email,
    tms: Date.now(),
    type: type === null ? 'other' : type,
    // include title in request body from frontend
    body: body
  }
}

function getByUser(email){
  var existingParams = {
    TableName: TABLE,
    IndexName: 'creatorIndex',
    KeyConditionExpression: 'creator = :user',
    ExpressionAttributeValues: {
      ':user': email
    },
    "ProjectionExpression": "iId, creator"
  };
  return new Promise(resolve => {
    Dynamo.query(existingParams, (err, data) => {
      err ? console.error(err) : console.log(data);
      resolve(data);
    });
  });
}

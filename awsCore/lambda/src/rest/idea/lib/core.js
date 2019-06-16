
const Idea = require('./schema/IdeaResponse');

module.exports = (tkn, method, body, iId, type) => {
  return new Promise(async (resolve, reject) => {
    var res = null;
    var idea = new Idea(tkn);
    idea = await idea.getUserInfo();
    switch (method) {

      case 'GET':
        res = await idea.getIdeas(iId);
      break;

      case 'POST':
        res = await idea.postNewIdea(body, type);
      break;

      case 'PUT':
        res = await idea.updateIdea(body, iId);
      break;

      case 'DELETE':
        res = await idea.deleteIdea(iId);
      break;

    }

    if (idea === null) {
      reject({code: 401, msg: 'AccessToken invalid'});
    }
    if (res.code) {
      reject(res);
    } else {
      resolve(res);
    }
  });
};

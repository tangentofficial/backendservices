
const shortid = require('shortid');

const Core = require ('./lib/core');

exports.handler = (event, context, cb) => {
  const response = (code, msg) => {
    if (msg) console.log(JSON.stringify(msg, null, 1));
    cb(null, {
      statusCode: code,
      body: msg ? JSON.stringify(msg) : '',
      headers: {
        "Access-Control-Allow-Origin": "*",
        // set CORS
        "Content-Type": "application/json"
      }
    });
  }

  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : null;
  const tkn = event.headers.Authorization || null;

  var iId = event.resource && event.resource === 'ideas/{iId}' && event.pathParameters && event.pathParameters.iId
    ? event.pathParameters.iId : null;

  var type = body && body.type ? body.type : null;

  if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) < 0) {
    response(405, 'HTTP method not allowed');
  }
  if (tkn === null) {
    response(401, 'No AccessToken present in request Authorization header');
  }
  Core(tkn, method, body, iId, type)
    .then(res => {
      response(200, res);
    }, err => {
      response(err.code, err.msg);
    });

}


const tkn =
  `eyJraWQiOiJ1cDNJeUpDRWZtbzNLYlVPREtQTVEwNWFTTGZEanlcLzFhZXVzTkkrcVJYOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjMDU1NGQ4OC1jZGUzLTRjZmItODc0Zi1jMjAwMmE0MWJhYTMiLCJldmVudF9pZCI6ImE0YmRhYWJiLWRiYzUtNDg4ZC1hM2M1LTE0NzRjYjdmOGQ0MyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE1NjA2NzI0MDcsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX1k0TVp6NWVWciIsImV4cCI6MTU2MDY3NjAwNywiaWF0IjoxNTYwNjcyNDA3LCJqdGkiOiI3NDczZjhkMi0zN2U3LTRmYWQtYjhmNy0yNjUxOTIwMmIyNDAiLCJjbGllbnRfaWQiOiI5Mm9qa29nNjg0ajBob3U2Z2czM2Y1dGkxIiwidXNlcm5hbWUiOiJjMDU1NGQ4OC1jZGUzLTRjZmItODc0Zi1jMjAwMmE0MWJhYTMifQ.P2OTi3-J4Jjc5UIPh87N9u23Ou504WALSYGD1JccOOXawmi2vgpsyyzCw6jvVEiv0VSRgcFcV3iWiIjVb-0ekZusjj9qsNaiJ_RxKxgjefF4_N1q3xshvbRFfxpR_p0TyAIcIkkvaP_ZK5zz3LYG5xVjFhye6TFgN-PmyTh8wgzJBOZ7ppFEjFMLouPqLMEHu8dsHVgNc8Vs6Y-PaV0UjlN8wl86KZYLgC2xTSnUUAFpyrbQep4p1i0IdPJoMB4I_Ma0D8Yuj9vkDXjrf_xq6CsdXcxKDFxOyEsNmBAt7HMmadEjebRvrE_YcVOgBP1iC7XSGSRSo-RSWBpM9csenA`;

const TestEvent = {
  httpMethod: 'DELETE',
  headers: {
    Authorization: tkn
  },
  body: JSON.stringify({
    title: 'Get monies',
    body: 'Mow the grass',
    type: 'business'
  }),
  resource: 'ideas/{iId}',
  pathParameters: {
    iId: 'CuS-MCPZ5-BHw4E3cNpq'
  }
}

exports.handler(TestEvent, '', (err, res) => {
  err ? console.error() : console.log(res);
});

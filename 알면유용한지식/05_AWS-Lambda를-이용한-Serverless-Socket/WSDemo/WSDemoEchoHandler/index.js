// apply the patch
require('./patch.js');

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const { TABLE_NAME } = process.env;

let send = undefined;

function init(event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  send = async (connectionId, data) => {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `${data}` }).promise();
  }
}

exports.handler = async(event) => {
  init(event);
  const myConnectionId = event.requestContext.connectionId;

  let connectionData;
  try {
    connectionData = await ddb.scan({ TableName: TABLE_NAME, ProjectionExpression: 'connectionId' }).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  //let data1 = JSON.parse(event.body).data
  
  const calls = connectionData.Items.map(async ({ connectionId }) => {
    await send(connectionId, myConnectionId + " : " + JSON.parse(event.body).data);
  });
  
  await Promise.all(calls);
  
  // the return value is ignored when this function is invoked from WebSocket gateway
  return {};
};


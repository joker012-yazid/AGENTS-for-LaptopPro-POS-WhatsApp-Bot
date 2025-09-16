const { SessionsClient } = require('@google-cloud/dialogflow');
let client;
async function detectIntent(text, sessionId, lang = 'ms') {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  if (!projectId) {
    throw new Error('DIALOGFLOW_PROJECT_ID tidak ditetapkan');
  }
  if (!client) {
    const options = {};
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      options.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
    client = new SessionsClient(options);
  }
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: lang },
    },
  };
  const [response] = await client.detectIntent(request);
  return response.queryResult;
}
module.exports = { detectIntent };

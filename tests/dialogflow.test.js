jest.mock('@google-cloud/dialogflow', () => {
  const detectIntent = jest.fn().mockResolvedValue([{ queryResult: { fulfillmentText: 'hi' } }]);
  const projectAgentSessionPath = jest.fn().mockReturnValue('session');
  const SessionsClient = jest.fn().mockImplementation(() => ({ detectIntent, projectAgentSessionPath }));
  return { SessionsClient };
});

describe('detectIntent', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.DIALOGFLOW_PROJECT_ID;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  test('throws when project id missing', async () => {
    const { detectIntent } = require('../services/dialogflow');
    await expect(detectIntent('hi', 'sess')).rejects.toThrow('DIALOGFLOW_PROJECT_ID');
  });

  test('calls Dialogflow client', async () => {
    process.env.DIALOGFLOW_PROJECT_ID = 'proj';
    const { detectIntent } = require('../services/dialogflow');
    const res = await detectIntent('hi', 'sess', 'ms');
    expect(res.fulfillmentText).toBe('hi');
  });
});

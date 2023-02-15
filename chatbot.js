const { ActivityHandler, TeamsActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');

class MyBot extends TeamsActivityHandler {
  async onMessageActivity(context, next) {
    const response = await this.getFinalResponse(context.activity.text);
    const reply = MessageFactory.text(response);
    await context.sendActivity(reply);
    await next();
  }

  async getFinalResponse(prompt) {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci/chat', {
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 50
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    return response.data.choices[0].text.trim();
  }
}

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new MyBot();

adapter.onTurnError = async (context, error) => {
    console.error(error);
    await context.sendActivity('An error occurred.');
};

const server = restify.createServer();
server.listen(process.env.PORT || 3978, () => {
    console.log(`${server.name} listening on ${server.url}`);
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

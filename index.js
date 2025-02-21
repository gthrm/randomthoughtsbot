require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const prompts = [
  "Поразмышляй философски о смысле жизни в современном мире",
  "Расскажи странную историю из жизни выдуманного персонажа",
  "Придумай абсурдную теорию о том, почему люди зевают",
  "Напиши сюрреалистическое описание обычного дня",
];

const CONFIG = {
  telegramToken: process.env.TELEGRAM_TOKEN,
  openaiToken: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  maxTokens: 100,
  temperature: 0.9,
};

function initializeClients() {
  const bot = new TelegramBot(CONFIG.telegramToken, { polling: true });
  const openai = new OpenAI({
    apiKey: CONFIG.openaiToken,
  });

  return { bot, openai };
}

function prepareOpenAIMessage(message) {
  return {
    messages: [
      {
        role: "system",
        content:
          "Ты - эксцентричный мыслитель. Дай короткий (2-3 предложения) странный и неожиданный ответ. Максимально всрато, как будто ты нахуярился спидами, кокосом, грибами и вот этим всем, но очень умный и физик!",
      },
      {
        role: "user",
        content: message || prompts[Math.floor(Math.random() * prompts.length)],
      },
    ],
    model: CONFIG.model,
    max_tokens: CONFIG.maxTokens,
    temperature: CONFIG.temperature,
  };
}

async function getOpenAIResponse(openai, message) {
  try {
    const completion = await openai.chat.completions.create(
      prepareOpenAIMessage(message)
    );
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw error;
  }
}

function handleError(bot, chatId, error) {
  console.error("Error:", error);
  bot.sendMessage(chatId, "Ошибка! Попробуй еще раз.");
}

async function handleStart(bot, openai, msg) {
  const chatId = msg.chat.id;
  try {
    const response = await getOpenAIResponse(openai);
    bot.sendMessage(chatId, response);
  } catch (error) {
    handleError(bot, chatId, error);
  }
}

async function handleMessages(bot, openai, msg) {
  const chatId = msg.chat.id;
  const isReplyToBot =
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    msg.reply_to_message.from.is_bot;

  if (!isReplyToBot) {
    return;
  }

  try {
    const response = await getOpenAIResponse(openai, msg.text);
    bot.sendMessage(chatId, response);
  } catch (error) {
    handleError(bot, chatId, error);
  }
}

function startBot() {
  const { bot, openai } = initializeClients();

  bot.onText(/\/start/, (msg) => handleStart(bot, openai, msg));
  bot.on("message", (msg) => handleMessages(bot, openai, msg));

  bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
  });

  console.log("Bot is running...");
}

startBot();

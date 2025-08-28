const OpenAI = require("openai");
const { UserDetails, Posts, Comments, Files, Subscriptions } = require("../models/index");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getUsers() {
  try {
    const users = await UserDetails.findAll({
      where: { is_deleted: false },
      attributes: ["id", "name", "email", "role", "is_deleted", "createdAt"], // only safe fields
      order: [["id", "ASC"]],
      raw: true,
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch users" };
  }
}

async function getUsersImage() {
  try {
    const users = await Files.findAll({
      where: { is_deleted: false },
      attributes: [
        "id",
        "filename",
        "fileLink",
        "user_name",
        "userDetailsId",
        "createdAt",
      ], // only safe fields
      order: [["id", "ASC"]],
      raw: true,
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch users" };
  }
}

async function getUsersPost() {
  try {
    const users = await Posts.findAll({
      where: { is_deleted: false },
      attributes: [
        "id",
        "title",
        "post_description",
        "user_name",
        "userDetailsId",
        "createdAt",
      ], // only safe fields
      order: [["id", "ASC"]],
      raw: true,
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch users" };
  }
}

async function getUsersPostcomments() {
  try {
    const users = await Comments.findAll({
      where: { is_deleted: false },
      attributes: [
        "id",
        "comments",
        "postID",
        "user_name",
        "userDetailsId",
        "createdAt",
      ], // only safe fields
      order: [["id", "ASC"]],
      raw: true,
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch users" };
  }
}

async function getUsersSubscription() {
  try {
    const users = await Subscriptions.findAll({
      where: { is_deleted: false },
      attributes: [
        "id",
        "planName",
        "price",
        "startDate",
        "endDate",
        "status",
        "userDetailsId",
        "createdAt",
      ], // only safe fields
      order: [["id", "ASC"]],
      raw: true,
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch users" };
  }
}

// Define tools
const tools = { getUsers, getUsersImage, getUsersPost, getUsersPostcomments, getUsersSubscription };
const toolSchemas = [
  {
    type: "function",
    function: {
      name: "getUsers",
      description:
        "Fetch all non-deleted users with their id, name, email, and role",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUsersImage",
      description:
        "Fetch all non-deleted images with their id, filname, fileLink, user_name, userDeta, created at",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUsersPost",
      description:
        "Fetch all non-deleted images with their id, title, post_description, user_name, created at",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUsersPostcomments",
      description:
        "Fetch all non-deleted images with their id, comments, postID, user_name, user_name, created at",
      parameters: { type: "object", properties: {} },
    },
  },
    {
    type: "function",
    function: {
      name: "getUsersSubscription",
      description:
        "Fetch all non-deleted images with their id, planName, price, status,startDate, endDate, created at",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function callAgent(userPrompt) {
  const messages = [
    {
      role: "system",
      content: `You are Josh, a helpful assistant. 
- If the user asks for details (like name, email, role, posts, subscription, etc.), call the right tool. 
- Never reply with "I don't know" if the data is available in the tool results. And give result only they ask not more than that`,
    },
    { role: "user", content: userPrompt },
  ];

  while (true) {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toolSchemas,
    });

    const response = completion.choices[0].message;
    const toolCalls = response.tool_calls;

    if (!toolCalls) {
      return response.content; // Final AI response
    }

    //  push assistant response ONCE
    messages.push(response);

    for (const tool of toolCalls) {
      const funcName = tool.function.name;
      const funcArgs = tool.function.arguments
        ? JSON.parse(tool.function.arguments)
        : {};

      if (tools[funcName]) {
        const result = await tools[funcName](funcArgs);

        // respond to THIS specific tool_call_id
        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          content: JSON.stringify(result),
        });
      } else {
        console.warn(`Unknown tool requested: ${funcName}`);
      }
    }
  }
}


module.exports = { callAgent };

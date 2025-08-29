const OpenAI = require("openai");
const {
  UserDetails,
  Posts,
  Comments,
  Files,
  Subscriptions,
} = require("../models/index");

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

async function addUserPost({ userDetailsId, title, post_description }) {
  const user = await UserDetails.findOne({
    where: { id: userDetailsId, is_deleted: false },
    raw: true,
  });
  if (!user) return { error: "User does not exist" };

  const post = await Posts.create({
    title,
    post_description,
    user_name: user.name,
    userDetailsId,
  });

  return { success: true, post };
}

// Define tools
const tools = {
  getUsers,
  getUsersImage,
  getUsersPost,
  getUsersPostcomments,
  getUsersSubscription,
  addUserPost,
};
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
  {
    type: "function",
    function: {
      name: "addUserPost",
      description: "Add a post for a user with title and description",
      parameters: {
        type: "object",
        properties: {
          userDetailsId: { type: "integer" },
          title: { type: "string" },
          post_description: { type: "string" },
        },
        required: ["userDetailsId", "title", "post_description"],
      },
    },
  },
];

async function callAgent(userPrompt) {
const messages = [
  {
    role: "system",
    content: `You are Josh, a helpful assistant. 
- Always return **plain text sentences in one paragraph**, no Markdown, no line breaks (\n), no bullets.
- If the user asks for details (like name, email, role, posts, subscription, etc.), call the right tool and return a plain sentence.
- If the user asks something not related to tools, answer normally in plain text.
- Never reply with "I don't know" if data is available.
- Only return what the user asks for, nothing extra.`,
  },
  { role: "user", content: userPrompt },
];


  const MAX_ITERATIONS = 5; // safety limit
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toolSchemas,
    });

    const response = completion.choices[0].message;
    const toolCalls = response.tool_calls;

    if (!toolCalls) {
      return response.content || "No response generated.";
    }

    // Push AI request
    messages.push(response);

    // Process tool calls in parallel with map + Promise.all
    await Promise.all(
      toolCalls.map(async (tool) => {
        const funcName = tool.function.name;
        let funcArgs = {};
        try {
          funcArgs = tool.function.arguments
            ? JSON.parse(tool.function.arguments)
            : {};
        } catch {
          console.warn(`Failed to parse arguments for ${funcName}`);
        }

        let result;

        if (tools[funcName]) {
          result = await tools[funcName](funcArgs);
        } else {
          console.warn(`Unknown tool requested: ${funcName}`);
          result = { error: "Unknown tool" };
        }

        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          content: JSON.stringify(result),
        });
      })
    );
  }

  return "Sorry, I couldn't complete your request after multiple attempts.";
}

module.exports = { callAgent };

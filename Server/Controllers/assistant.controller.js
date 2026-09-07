import User from "../Models/user.model.js";
import { generateGeminiResponse } from "../Configs/gemini.js";

export const getAssistantConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-geminiApiKey");
    if (!user) {
      return res.status(404).json({ message: "failed to get user" });
    }

    return res.status(200).json({ message: "Assistant Config data", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Assistant Config failed ${error}` });
  }
};

export const askAssistant = async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      return res
        .status(400)
        .json({ message: "Message and UserId are requires" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.geminiApiKey) {
      return res.status(404).json({ message: "Gemini Api Key is required" });
    }

    if (!user.plan === "free" && user.totalMessage >= user.requestLimit) {
      return res
        .status(400)
        .json({ message: "Limit exhausted for free plan upgrade now!" });
    }

    if (user.plan === "pro" && new Date(user.proExpiresAt) < new Date()) {
      user.plan = "free";

      await user.save();
      return res.status(400).json({ message: "pro plane expires" });
    }

    const cleanMessage = message.toLowerCase();

    if (user.enableNavigation) {
      // Navigation Commands
      const navigationWords = [
        "open",
        "go",
        "start",
        "show",
        "navigate",
        "take me",
      ];

      // Check navigation intent
      const wantsNavigation = navigationWords.some((word) =>
        cleanMessage.startsWith(word),
      );

      // User wants navigation
      if (wantsNavigation) {
        // Find matching page
        const matchedPage = user.pages.find((page) =>
          page.keywords.some((keyword) =>
            cleanMessage.includes(keyword.toLowerCase()),
          ),
        );

        // Page found
        if (matchedPage) {
          // Already open
          if (req.body.currentPath === matchedPage.path) {
            return res.json({
              success: true,

              response: `${matchedPage.name} already open`,
            });
          }

          // Navigate
          return res.json({
            success: true,

            action: "navigate",

            path: matchedPage.path,

            response: `Opening ${matchedPage.name}`,
          });
        }
      }
    }

    const prompt = `

You are ${user.assistantName}.

Business Name:
${user.businessName}

Business Type:
${user.businessType}

Business Description:
${user.businessDescription}

Assistant Tone:
${user.tone}


Rules:

- Keep replies under 15 words
- Give fast direct responses
- Talk naturally
- Behave like smart voice assistant
- Avoid long explanations
- Keep responses short for quick voice playback
- Detect if the user wants to navigate somewhere on the website (e.g. "go to homepage", "open contact page", "show pricing")
- If navigation is requested, respond ONLY with this exact JSON, no extra text:
  {"response": "<short spoken reply>", "path": "<route path, e.g. / or /contact or /pricing>"}
- If no navigation is requested, respond ONLY with this exact JSON:
  {"response": "<short spoken reply>", "path": null}
- Always respond with valid JSON only. No markdown, no backticks, no extra commentary.


User Question:
${message}

`;

    const aiResponse = await generateGeminiResponse({
      prompt,
      apikey: user.geminiApiKey,
      user,
    });

    if (user.plan === "free") {
      user.totalMessages += 1;

      await user.save();
    }
    let parsed;
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = { response: aiResponse, path: null };
    }

    return res.json({
      success: true,
      aiResponse: parsed.response,
      response: parsed.response,
      path: parsed.path,
      action: parsed.path ? "navigate" : "chat",
    });
  } catch (error) {
    console.log(error);

    if (error?.status === 503 || error?.error?.code === 503) {
      return res.status(503).json({
        success: false,
        message:
          "The AI assistant is temporarily overloaded. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Assistant AI Error",
    });
  }
};

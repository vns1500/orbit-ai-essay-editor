// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');
// const axios = require('axios');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const prisma = new PrismaClient();

// async function testDBConnection() {
//   try {
//     await prisma.$connect();
//     console.log("✅ Connected to database");
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//   }
// }
// testDBConnection();


// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// /* ============================================================
//    ✅ ENV VALIDATION
//    ============================================================ */
// if (!process.env.JWT_SECRET) {
//   console.error("❌ Missing JWT_SECRET in .env");
//   process.exit(1);
// }
// if (!process.env.HF_TOKEN) {
//   console.error("❌ Missing HF_TOKEN in .env");
//   process.exit(1);
// }
// if (!process.env.MODEL_NAME) {
//   console.warn("⚠️ MODEL_NAME not set, using mistralai/Mistral-7B-Instruct-v0.2");
//   process.env.MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
// }

// /* ============================================================
//    🩺 HEALTH CHECK
//    ============================================================ */
// app.get('/', (req, res) => res.json({ ok: true, model: process.env.MODEL_NAME }));

// /* ============================================================
//    🧍 USER AUTHENTICATION
//    ============================================================ */

// // 🔹 Signup (Register)
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!email || !password || !name)
//       return res.status(400).json({ error: "All fields are required" });

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) return res.status(400).json({ error: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, password: hashedPassword },
//     });

//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({ message: "Signup successful", token, user: { id: user.id, name, email } });
//   } catch (err) {
//     console.error("❌ Signup error:", err);
//     res.status(500).json({ error: "Signup failed" });
//   }
// });

// // 🔹 Login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password required" });

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({
//       message: "Login successful",
//       token,
//       user: { id: user.id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// // 🔹 Middleware: Verify JWT
// const authenticateUser = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ error: "Missing auth header" });

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ error: "Invalid token" });
//     req.user = decoded;
//     next();
//   });
// };

// // 🔹 Profile Route
// app.get('/api/auth/profile', authenticateUser, async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.userId },
//       select: { id: true, name: true, email: true, createdAt: true },
//     });
//     res.json({ user });
//   } catch (err) {
//     console.error("❌ Profile fetch error:", err);
//     res.status(500).json({ error: "Failed to fetch profile" });
//   }
// });

// /* ============================================================
//    🧠 ESSAY EVALUATION (via Hugging Face)
//    ============================================================ */
// app.post('/api/evaluate', async (req, res) => {
//   try {
//     const { essayText } = req.body;
//     if (!essayText || essayText.trim().length < 40) {
//       return res.status(400).json({ error: 'Essay text too short (min 40 characters).' });
//     }

//     const words = essayText.split(/\s+/).filter(Boolean).length;
//     const sentences = (essayText.match(/[.!?]+/g) || []).length || 1;

//     const prompt = `
// You are an expert essay evaluator. Read the essay below and return ONLY a JSON response in this structure:

// {
//   "clarity": number (0-100),
//   "grammar": number (0-100),
//   "tone": number (0-100),
//   "impact": number (0-100),
//   "topic": "string",
//   "writingStyle": "string",
//   "summary": "string",
//   "highlightedText": [{"sentence": "string", "issue": "string"}],
//   "sectionBreakdown": {"introduction": "string", "body": "string", "conclusion": "string"},
//   "suggestions": ["string", "string"],
//   "improvementTips": "string"
// }

// Essay:
// ${essayText}
// `;

//     console.log("🧠 Evaluating essay via model:", process.env.MODEL_NAME);
//     const hfResponse = await axios.post(
//       `https://api-inference.huggingface.co/models/${process.env.MODEL_NAME}`,
//       { inputs: prompt },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HF_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const rawOutput = hfResponse.data?.[0]?.generated_text || "";
//     if (!rawOutput) throw new Error("Empty response from model.");

//     const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in model response.");

//     const aiResult = JSON.parse(jsonMatch[0]);
//     const { clarity = 70, grammar = 70, tone = 70, impact = 70 } = aiResult;
//     const overallScore = Math.round((clarity + grammar + tone + impact) / 4);

//     const feedback = {
//       ...aiResult,
//       details: { words, sentences },
//       progress: {
//         clarity: clarity / 100,
//         grammar: grammar / 100,
//         tone: tone / 100,
//         impact: impact / 100,
//         overall: overallScore / 100,
//       },
//     };

//     res.json({ score: overallScore, feedback });
//   } catch (err) {
//     console.error("🔥 AI Evaluation Error:", err);
//     res.status(500).json({
//       error: "AI Evaluation failed.",
//       details: err.response?.data || err.message,
//     });
//   }
// });

// /* ============================================================
//    💾 SAVE ESSAY + HISTORY
//    ============================================================ */
// app.post('/api/save', authenticateUser, async (req, res) => {
//   try {
//     const { essayText, feedback, score } = req.body;
//     if (!essayText) return res.status(400).json({ error: "Essay text missing" });

//     const essay = await prisma.essay.create({
//       data: {
//         userId: req.user.userId,
//         essayText,
//         feedback,
//         score,
//       },
//     });

//     res.json({ success: true, essay });
//   } catch (err) {
//     console.error("💾 Save error:", err);
//     res.status(500).json({ error: "Failed to save essay" });
//   }
// });

// app.get('/api/history', authenticateUser, async (req, res) => {
//   try {
//     const essays = await prisma.essay.findMany({
//       where: { userId: req.user.userId },
//       orderBy: { createdAt: 'desc' },
//     });
//     res.json({ essays });
//   } catch (err) {
//     console.error("📜 History fetch error:", err);
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// /* ============================================================
//    🚀 SERVER START
//    ============================================================ */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

/* ============================================================
   🧩 MIDDLEWARE
   ============================================================ */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // ✅ Allow your React frontend
    credentials: true,
  })
);
app.use(bodyParser.json());

// ✅ Check essential env vars
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in .env file");
  process.exit(1);
}

/* ============================================================
   🩺 HEALTH CHECK
   ============================================================ */
app.get('/', (req, res) => {
  res.json({ ok: true, message: "✅ Backend is running fine!" });
});

/* ============================================================
   🔹 DATABASE CONNECTION TEST
   ============================================================ */
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

/* ============================================================
   🧍 AUTHENTICATION ROUTES
   ============================================================ */

// 🔸 Signup
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Signup successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🔸 Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================================================
   🔒 AUTH MIDDLEWARE
   ============================================================ */
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ JWT verification failed:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("❌ Auth middleware error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

/* ============================================================
   👤 PROFILE
   ============================================================ */
app.get('/api/auth/profile', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* ============================================================
   🧠 MOCK ESSAY EVALUATION
   ============================================================ */
app.post('/api/evaluate', (req, res) => {
  try {
    const { essayText } = req.body;

    if (!essayText || essayText.trim().length < 20) {
      return res.status(400).json({
        error: "Essay too short. Please write at least 20 characters.",
      });
    }

    const feedback = {
      clarity: 80,
      grammar: 75,
      tone: 85,
      impact: 78,
      topic: "Mock Essay Topic",
      writingStyle: "Analytical",
      summary: "This is a mock summary of your essay.",
      highlightedText: [
        { sentence: "This is a weak opening.", issue: "Lacks strong hook" },
        { sentence: "Conclusion could be more impactful.", issue: "Needs stronger closure" },
      ],
      sectionBreakdown: {
        introduction: "Decent opening, could use more context.",
        body: "Well structured, logical flow.",
        conclusion: "Summarized points but lacks emotional impact.",
      },
      suggestions: [
        "Use more transition words.",
        "Vary sentence length for better rhythm.",
      ],
      improvementTips: "Practice clarity and argument strength in your essays.",
      progress: {
        clarity: 0.8,
        grammar: 0.75,
        tone: 0.85,
        impact: 0.78,
        overall: 0.8,
      },
    };

    res.json({ score: 80, feedback });
  } catch (err) {
    console.error("🔥 Mock Evaluation Error:", err);
    res.status(500).json({ error: "Mock evaluation failed" });
  }
});

/* ============================================================
   💾 SAVE ESSAY + HISTORY
   ============================================================ */
app.post('/api/save', authenticateUser, async (req, res) => {
  try {
    const { essayText, feedback, score } = req.body;
    if (!essayText)
      return res.status(400).json({ error: "Essay text missing" });

    const essay = await prisma.essay.create({
      data: {
        userId: req.user.userId,
        essayText,
        feedback,
        score,
      },
    });

    res.json({ success: true, essay });
  } catch (err) {
    console.error("💾 Save error:", err);
    res.status(500).json({ error: "Failed to save essay" });
  }
});

app.get('/api/history', authenticateUser, async (req, res) => {
  try {
    const essays = await prisma.essay.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ essays });
  } catch (err) {
    console.error("📜 History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/* ============================================================
   🚀 START SERVER
   ============================================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

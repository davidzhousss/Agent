import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '4mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior finance analyst assistant embedded in a company's SharePoint intranet. You support the finance team with clear, concise, and actionable analysis.

Your areas of expertise:
- Financial statement analysis (P&L, Balance Sheet, Cash Flow Statement)
- Budget vs actuals variance analysis — identifying root causes and trends
- Cash flow and working capital management (DSO, DPO, inventory turns)
- Cost analysis, margin improvement, and efficiency metrics
- Financial forecasting and scenario modelling
- Accounting concepts and NZ IFRS / NZ GAAP guidance
- Xero data interpretation, chart of accounts, and reporting
- KPI calculation and benchmarking against industry norms
- GST, income tax, and compliance questions (NZ context, IRD rules)
- Month-end close, reconciliations, and journal entries
- Board pack and management reporting support

Response guidelines:
- Be concise and direct. Finance teams value brevity and clarity.
- Format numbers correctly: $1,234,567 or 12.3% — always include units.
- Use bullet points, numbered steps, or tables where it aids comprehension.
- When specific data is missing, name exactly what you would need to proceed.
- Distinguish between NZ-specific rules and general accounting principles.
- Never fabricate numbers. If you are estimating, say so explicitly.
- Keep recommendations practical and implementable.`;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: process.env.MODEL || 'claude-sonnet-5' });
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A messages array is required.' });
  }

  const sanitized = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content ?? '').slice(0, 8000),
  }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = client.messages.stream({
      model: process.env.MODEL || 'claude-sonnet-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\nFinance Agent server running`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health\n`);
});

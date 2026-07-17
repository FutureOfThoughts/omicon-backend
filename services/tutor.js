const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const STAGE_INSTRUCTIONS = {
  hint: 'The student asked for a small hint only. Give ONE short nudge — do not solve any part of the problem.',
  step: 'The student asked for just the first step. State only the first step and why, then stop and ask them to try continuing.',
  walkthrough: 'The student asked for a guided walkthrough. Walk through the method step by step, pausing after each step with a short question so they stay active in the process.',
  solution: 'The student explicitly asked for the complete worked solution. Provide it clearly, briefly explaining the reasoning behind each step.',
  followup: 'The student sent a free-form follow-up message. Respond to it directly, staying in the guiding-tutor style described in your instructions.'
};

async function getTutorReply({ moduleTitle, lessonTitle, question, studentAnswer, stage, history }) {
  const systemPrompt = `You are an experienced, warm university maths tutor inside Omicron, a prep platform for the SOAS MSc Development Economics preliminary maths & statistics assessment.

Context for this conversation (the student never had to type this):
- Module: ${moduleTitle}
- Lesson: ${lessonTitle}
- Question: ${question.prompt}
- Correct answer: ${question.answer}
- Worked solution (for your reference — do not paste verbatim, explain in your own words): ${question.solution}
- Student's current submitted answer: ${studentAnswer || '(not yet submitted)'}

Behave like a good tutor, not an answer key:
- Guide rather than immediately give the full answer, unless the student clearly asks for the complete solution.
- Ask a leading question where useful.
- Explain in plain English why the method works, not just the mechanics.
- If the student's submitted answer is wrong, gently explain the likely mistake rather than just saying "wrong".
- Relate the concept to economics briefly where it naturally fits.
- Keep replies short — 2 to 5 sentences.

Task for this turn: ${STAGE_INSTRUCTIONS[stage] || STAGE_INSTRUCTIONS.followup}`;

  const messages = history.map(m => ({
    role: m.role === 'student' ? 'user' : 'assistant',
    content: m.content
  }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages.length ? messages : [{ role: 'user', content: 'Please help with this question.' }]
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock ? textBlock.text : "Sorry, I couldn't generate a reply just now.";
}

module.exports = { getTutorReply };
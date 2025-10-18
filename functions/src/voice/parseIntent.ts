import * as functions from 'firebase-functions';

export type Intent =
  | 'add_child'
  | 'assign_chore'
  | 'show_usage'
  | 'grant_bonus'
  | 'set_budget'
  | 'pause_time'
  | 'resume_time';

export type Entities = {
  child?: string | null;
  phone?: string | null;
  minutes?: number | null;
  task?: string | null;
  timeRange?: string | null;
  dueAt?: string | null;
};

export type ParseIntentResponse = {
  intent: Intent | null;
  entities: Entities;
};

export const parseIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const text: string = data?.text ?? '';
  if (!text.trim()) {
    return { intent: null, entities: {} };
  }

  // Simple rule-based fallback for common patterns
  const lower = text.toLowerCase();
  const entities: Entities = {};

  // Extract phone numbers
  const phoneMatch = text.match(/(?:phone|number|cell)\D*(\d[\d\-\s]{6,}\d)/i);
  if (phoneMatch) {
    entities.phone = phoneMatch[1].replace(/\D/g, '');
  }

  // Extract minutes
  const minutesMatch = text.match(/(\d{1,3})\s*(?:min|minutes?)/i);
  if (minutesMatch) {
    entities.minutes = parseInt(minutesMatch[1], 10);
  }

  // Extract child name
  const childMatch = text.match(/(?:for|add|have|give|show|approve)\s+([A-Z][a-zA-Z]+)/i);
  if (childMatch) {
    entities.child = childMatch[1];
  }

  // Extract task
  const taskKeywords = ['dishes', 'trash', 'clean room', 'tidy', 'laundry'];
  for (const keyword of taskKeywords) {
    if (lower.includes(keyword)) {
      entities.task = keyword.replace(' ', '_');
      break;
    }
  }

  // Extract time range
  if (/(?:today|tonight)/i.test(text)) entities.timeRange = 'today';
  else if (/week/i.test(text)) entities.timeRange = 'week';
  else if (/month/i.test(text)) entities.timeRange = 'month';

  // Intent detection with improved patterns
  let intent: Intent | null = null;

  if (/^add\b|\badd\b.*\b(phone|number)/i.test(text)) {
    intent = 'add_child';
  } else if (/have\s+.+\s+(put away|do|clean|take out)/i.test(text)) {
    intent = 'assign_chore';
  } else if (/how much.*screen.*time|show.*screen.*time/i.test(text)) {
    intent = 'show_usage';
  } else if (/give.*bonus|add.*minutes/i.test(text)) {
    intent = 'grant_bonus';
  } else if (/set.*budget|daily.*minutes/i.test(text)) {
    intent = 'set_budget';
  } else if (/pause.*time/i.test(text)) {
    intent = 'pause_time';
  } else if (/resume.*time/i.test(text)) {
    intent = 'resume_time';
  }

  // TODO: Integrate with LLM provider (OpenAI/Vertex AI) for more sophisticated parsing
  // For now, return the rule-based result
  return { intent, entities } as ParseIntentResponse;
});

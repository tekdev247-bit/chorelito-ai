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
  timeRange?: 'today' | 'yesterday' | 'week' | 'month' | null;
  dueAt?: string | null;
};

export type Parsed = { intent: Intent | null; entities: Entities };

const PHONE_RE = /(?:phone|number|cell)\D*(\d[\d\-\s]{6,}\d)/i;
const MINUTES_RE = /(\d{1,3})\s*(?:min|minutes?|hour|hours?)?/i;
const CHILD_RE = /(?:for|add|have|give|show|approve|to)\s+([A-Z][a-zA-Z]+)/i;
const CHILD_NAME_RE = /\b([A-Z][a-z]+)\b/g;

const TASK_MAP: Record<string,string> = {
  // Dishes variations
  'dishes': 'dishes', 'put away the dishes': 'dishes', 'wash dishes': 'dishes', 'do dishes': 'dishes',
  'kitchen': 'dishes', 'sink': 'dishes',
  
  // Trash variations
  'trash': 'trash', 'take out the trash': 'trash', 'garbage': 'trash', 'bin': 'trash',
  'take out garbage': 'trash', 'empty trash': 'trash',
  
  // Room cleaning variations
  'clean room': 'clean_room', 'tidy': 'clean_room', 'organize': 'clean_room', 'bedroom': 'clean_room',
  'clean up': 'clean_room', 'straighten': 'clean_room',
  
  // Laundry variations
  'laundry': 'laundry', 'wash clothes': 'laundry', 'fold clothes': 'laundry',
  
  // Bathroom variations
  'bathroom': 'bathroom', 'toilet': 'bathroom', 'clean bathroom': 'bathroom',
  
  // Living room variations
  'living room': 'living_room', 'family room': 'living_room', 'lounge': 'living_room',
  
  // Yard work variations
  'yard': 'yard_work', 'mow': 'yard_work', 'mow lawn': 'yard_work', 'garden': 'yard_work',
  
  // Pet care variations
  'feed': 'pet_care', 'walk': 'pet_care', 'dog': 'pet_care', 'cat': 'pet_care'
};

function pickTask(utterance: string): string | null {
  const lower = utterance.toLowerCase();
  
  // Sort by length (longest first) to match more specific phrases first
  const sortedKeys = Object.keys(TASK_MAP).sort((a, b) => b.length - a.length);
  
  for (const k of sortedKeys) {
    if (lower.includes(k)) return TASK_MAP[k];
  }
  return null;
}

function extractMinutes(utterance: string): number | null {
  // Enhanced minutes extraction with hours conversion
  const lower = utterance.toLowerCase();
  
  // Match "X hours" and convert to minutes
  const hourMatch = lower.match(/(\d+)\s*hours?/);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60;
  }
  
  // Match "X minutes"
  const minMatch = lower.match(/(\d+)\s*minutes?/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  
  // Match standalone numbers (assume minutes if no unit specified)
  const numMatch = lower.match(/\b(\d{1,3})\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    // Only return if it's a reasonable number for minutes (1-300)
    if (num >= 1 && num <= 300) {
      return num;
    }
  }
  
  return null;
}

function extractChildName(utterance: string): string | null {
  const lower = utterance.toLowerCase();
  
  // Skip common words that might be capitalized but aren't names
  const skipWords = new Set([
    'the', 'and', 'or', 'but', 'for', 'with', 'to', 'from', 'by', 'at', 'in', 'on', 'up', 'down',
    'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'time', 'minutes', 'hours',
    'phone', 'number', 'call', 'text', 'message', 'please', 'thanks', 'thank', 'you'
  ]);
  
  // Find all capitalized words
  const matches = utterance.match(CHILD_NAME_RE);
  if (!matches) return null;
  
  // Filter out skip words and return the first valid name
  for (const match of matches) {
    if (!skipWords.has(match.toLowerCase())) {
      return match;
    }
  }
  
  return null;
}

export function parseRules(utterance: string): Parsed {
  const u = utterance.trim();
  const lower = u.toLowerCase();
  const entities: Entities = {};

  // Extract phone number
  const phone = u.match(PHONE_RE)?.[1]?.replace(/\D/g, '') || null;
  if (phone) entities.phone = phone;

  // Extract minutes with enhanced parsing
  const minutes = extractMinutes(u);
  if (minutes) entities.minutes = minutes;

  // Extract child name with enhanced parsing
  const child = extractChildName(u);
  if (child) entities.child = child;

  // Extract task with enhanced mapping
  const task = pickTask(u);
  if (task) entities.task = task;

  // Extract time range
  if (/(?:today|tonight)/i.test(u)) entities.timeRange = 'today';
  else if (/week/i.test(u)) entities.timeRange = 'week';
  else if (/month/i.test(u)) entities.timeRange = 'month';

  // Intent detection with improved patterns
  let intent: Intent | null = null;
  
  // Add child patterns
  if (/^add\b|\badd\b.*\b(phone|number|child)/i.test(u) || 
      /invite.*child/i.test(u) || 
      /add.*kid/i.test(u)) {
    intent = 'add_child';
  }
  // Assign chore patterns
  else if (/have\s+.+\s+(put away|do|clean|take out|wash|fold|organize)/i.test(u) ||
           /assign.*chore/i.test(u) ||
           /give.*task/i.test(u) ||
           /chore.*for/i.test(u)) {
    intent = 'assign_chore';
  }
  // Show usage patterns
  else if (/how much.*screen.*time|show.*screen.*time|screen.*time.*usage/i.test(u) ||
           /usage.*today/i.test(u) ||
           /time.*used/i.test(u)) {
    intent = 'show_usage';
  }
  // Grant bonus patterns
  else if (/give.*bonus|add.*minutes|extra.*time|more.*time/i.test(u) ||
           /grant.*minutes/i.test(u) ||
           /bonus.*time/i.test(u)) {
    intent = 'grant_bonus';
  }
  // Set budget patterns
  else if (/set.*budget|daily.*minutes|screen.*time.*limit/i.test(u) ||
           /budget.*minutes/i.test(u) ||
           /limit.*time/i.test(u)) {
    intent = 'set_budget';
  }
  // Pause/resume patterns
  else if (/pause.*time|stop.*time|disable.*time/i.test(u)) {
    intent = 'pause_time';
  }
  else if (/resume.*time|start.*time|enable.*time/i.test(u)) {
    intent = 'resume_time';
  }

  return { intent, entities };
}

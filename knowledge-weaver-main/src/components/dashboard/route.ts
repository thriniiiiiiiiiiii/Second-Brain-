let summary = null;
let aiTags: string[] = [];

try {
  summary = await ClaudeService.summarize(content);
  aiTags = await ClaudeService.generateTags(title, content);
} catch {
  console.warn("Claude skipped");
}

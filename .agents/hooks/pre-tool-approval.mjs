import { readFileSync } from 'node:fs';

function respond(decision, reason) {
  process.stdout.write(`${JSON.stringify({ decision, reason })}\n`);
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    respond('force_ask', 'Could not inspect the proposed operation; human approval is required.');
    return;
  }

  const toolCall = payload?.toolCall;
  const toolName = toolCall?.name;
  const args = toolCall?.args ?? {};

  if (toolName === 'run_command') {
    const command = String(args.CommandLine ?? '');
    const migrationOperation =
      /\bprisma\s+migrate\s+(?:dev|deploy|reset|resolve)\b/i.test(command) ||
      /\bprisma\s+db\s+(?:push|execute)\b/i.test(command) ||
      /\bdb:(?:migrate|deploy)\b/i.test(command) ||
      /--accept-data-loss\b/i.test(command);
    const productionOperation =
      /\b(?:deploy|release)\b/i.test(command) ||
      /\b(?:terraform|tofu)\s+apply\b/i.test(command) ||
      /\bkubectl\s+(?:apply|rollout|set)\b/i.test(command) ||
      /\bhelm\s+upgrade\b/i.test(command) ||
      /\bpulumi\s+up\b/i.test(command) ||
      /\bvercel\s+.*--prod\b/i.test(command) ||
      /\b(?:gcloud|aws)\s+.*\b(?:deploy|release|update)\b/i.test(command);
    const destructiveOperation =
      /\b(?:drop\s+(?:table|database)|truncate\s+table|dropdb)\b/i.test(command) ||
      /\brm\s+-rf\b/i.test(command) ||
      /\bgit\s+(?:reset\s+--hard|clean\s+-[^\n]*f)\b/i.test(command) ||
      /\bdocker\s+compose\s+down\s+-v\b/i.test(command);

    if (migrationOperation) {
      respond('force_ask', 'Database migration or schema-write command requires explicit human approval.');
    } else if (productionOperation) {
      respond('force_ask', 'Deployment or release command requires explicit human authorization.');
    } else if (destructiveOperation) {
      respond('force_ask', 'Potentially destructive command requires explicit human approval.');
    } else {
      respond('allow');
    }
    return;
  }

  if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
    const target = String(args.TargetFile ?? '').replaceAll('\\', '/');
    const migrationFile = /(?:^|\/)prisma\/migrations\//i.test(target);
    const environmentFile = /(?:^|\/)\.env(?:\.[^/]*)?$/i.test(target) &&
      !/(?:^|\/)\.env(?:\.[^/]*)?\.example$/i.test(target);

    if (migrationFile) {
      respond('force_ask', 'Editing Prisma migration history requires explicit human approval.');
    } else if (environmentFile) {
      respond('force_ask', 'Editing a local environment file requires explicit human approval.');
    } else {
      respond('allow');
    }
    return;
  }

  respond('allow');
}

main();

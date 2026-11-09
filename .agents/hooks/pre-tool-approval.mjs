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
    respond(
      'force_ask',
      'Every shell command requires explicit human approval; command text cannot reliably identify indirect or wrapped operations.',
    );
    return;
  }

  if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
    const target = String(args.TargetFile ?? '').replaceAll('\\', '/');
    const migrationFile = /(?:^|\/)prisma\/migrations\//i.test(target);
    const prismaSchemaFile = /(?:^|\/)prisma\/schema\.prisma$/i.test(target);
    const environmentFile = /(?:^|\/)\.env(?:\.[^/]*)?$/i.test(target) &&
      !/(?:^|\/)\.env(?:\.[^/]*)?\.example$/i.test(target);

    if (migrationFile) {
      respond('force_ask', 'Editing Prisma migration history requires explicit human approval.');
    } else if (prismaSchemaFile) {
      respond('force_ask', 'Editing the Prisma schema requires explicit human approval.');
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

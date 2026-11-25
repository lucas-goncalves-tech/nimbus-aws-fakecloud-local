type LogFields = Record<string, unknown>;

function safe(fields: LogFields): LogFields {
  const output: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (/authorization|token|password|secret|pepper|credential/i.test(key)) {
      output[key] = "***HIDDEN***";
      continue;
    }
    output[key] = value;
  }
  return output;
}

function emit(level: "info" | "error", event: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...safe(fields),
  });
  if (level === "error") process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

export const logger = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};

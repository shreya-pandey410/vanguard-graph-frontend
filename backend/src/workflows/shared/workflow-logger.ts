export type LogLevel = "info" | "warn" | "error" | "debug";

export class WorkflowLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, msg: string, meta?: object) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      ctx: this.context,
      msg,
      ...(meta || {}),
    };
    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(msg: string, meta?: object) {
    this.log("info", msg, meta);
  }
  warn(msg: string, meta?: object) {
    this.log("warn", msg, meta);
  }
  error(msg: string, meta?: object) {
    this.log("error", msg, meta);
  }
  debug(msg: string, meta?: object) {
    this.log("debug", msg, meta);
  }
}

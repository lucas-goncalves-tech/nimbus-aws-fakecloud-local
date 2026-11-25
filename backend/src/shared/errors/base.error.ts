/** Nomes de classes que nao seguem o padrao WordWordError. */
const CODE_OVERRIDES: Record<string, string> = {
  NotfoundError: "NOT_FOUND",
  UnprocessableEntityError: "UNPROCESSABLE_ENTITY",
  TooManyRequestsError: "TOO_MANY_REQUESTS",
};

export class ErrorBase extends Error {
  status: number;
  details?: unknown;
  /** Codigo estavel para o contrato de erro: { code, message, requestId }. */
  readonly code: string;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    const name = this.constructor.name;
    this.code =
      CODE_OVERRIDES[name] ??
      name
        .replace(/Error$/, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toUpperCase();
  }
}

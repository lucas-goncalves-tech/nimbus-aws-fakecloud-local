import { NextFunction, Request, Response } from "express";
import { SessionsService } from "../../features/sessions/sessions.service";
import { UnauthorizedError } from "../errors/unauthorized.error";

export class ValidateSessionMiddleware {
  constructor(private readonly sessionsService: SessionsService) {}

  validateSession = async (req: Request, res: Response, next: NextFunction) => {
    // Token apenas no header Authorization. Nunca aceitar token na query:
    // ele vaza em historico, proxies e logs.
    const [scheme, sid] = req.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !sid) {
      throw new UnauthorizedError("Sessão inválida");
    }
    try {
      const session = await this.sessionsService.validateSession(sid);
      req.session = {
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
      };

      if (session.renewed) {
        res.setHeader("Authorization", `Bearer ${sid}`);
        res.setHeader("Access-Control-Expose-Headers", "Authorization");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

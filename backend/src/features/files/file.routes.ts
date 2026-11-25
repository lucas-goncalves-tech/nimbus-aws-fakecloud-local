import { Router, type NextFunction, type Request, type Response } from "express";
import { NotfoundError } from "../../shared/errors/not-found.error";
import { FileRepository } from "./file.repository";

export class FileRoutes {
  private readonly router = Router();
  private readonly repository = new FileRepository();

  constructor() {
    this.router.get("/:id", this.findById);
  }

  private findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await this.repository.findById(String(req.params.id));
      if (!record) throw new NotfoundError("Registro de arquivo nao encontrado");
      res.json({
        fileId: record.fileId,
        status: record.status,
        key: record.key,
        bucket: record.bucket,
        size: record.size,
        contentType: record.contentType,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        processedAt: record.processedAt,
      });
    } catch (error) {
      next(error);
    }
  };

  get getRouter(): Router {
    return this.router;
  }
}

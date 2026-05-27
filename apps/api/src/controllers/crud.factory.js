import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function crudController(repository, resourceName) {
  return {
    list: asyncHandler(async (req, res) => {
      const extraQuery = req.query.archived ? {} : { archivedAt: null };
      const result = await repository.list(req.companyId, req.query, extraQuery);
      res.json({ status: "success", data: result.items, meta: result.meta });
    }),

    get: asyncHandler(async (req, res) => {
      const item = await repository.findById(req.companyId, req.params.id);
      if (!item) throw new AppError(`${resourceName} not found`, 404);
      res.json({ status: "success", data: item });
    }),

    create: asyncHandler(async (req, res) => {
      const payload = req.validated?.body || req.body;
      const item = await repository.create(req.companyId, {
        ...payload,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
      await req.audit?.({ payload }, item._id.toString());
      res.status(201).json({ status: "success", data: item });
    }),

    update: asyncHandler(async (req, res) => {
      const payload = req.validated?.body || req.body;
      const item = await repository.update(req.companyId, req.params.id, {
        ...payload,
        updatedBy: req.user._id
      });
      if (!item) throw new AppError(`${resourceName} not found`, 404);
      await req.audit?.({ payload }, item._id.toString());
      res.json({ status: "success", data: item });
    }),

    archive: asyncHandler(async (req, res) => {
      const item = await repository.archive(req.companyId, req.params.id);
      if (!item) throw new AppError(`${resourceName} not found`, 404);
      await req.audit?.({}, item._id.toString());
      res.json({ status: "success", data: item });
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await repository.delete(req.companyId, req.params.id);
      if (!item) throw new AppError(`${resourceName} not found`, 404);
      await req.audit?.({}, item._id.toString());
      res.status(204).send();
    })
  };
}

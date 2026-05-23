import { buildQuery, pagination, sortOption } from "../utils/apiFeatures.js";

export class TenantRepository {
  constructor(model, searchableFields = [], allowedFilters = []) {
    this.model = model;
    this.searchableFields = searchableFields;
    this.allowedFilters = allowedFilters;
  }

  scoped(companyId, extra = {}) {
    return { company: companyId, ...extra };
  }

  async list(companyId, queryString = {}, extra = {}) {
    const { page, limit, skip } = pagination(queryString);
    const query = this.scoped(companyId, { ...buildQuery(queryString, this.allowedFilters), ...extra });

    if (queryString.search && this.searchableFields.length) {
      query.$or = this.searchableFields.map((field) => ({
        [field]: { $regex: queryString.search, $options: "i" }
      }));
    }

    const [items, total] = await Promise.all([
      this.model.find(query).sort(sortOption(queryString.sort)).skip(skip).limit(limit),
      this.model.countDocuments(query)
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  findById(companyId, id) {
    return this.model.findOne(this.scoped(companyId, { _id: id }));
  }

  create(companyId, payload) {
    return this.model.create({ ...payload, company: companyId });
  }

  update(companyId, id, payload) {
    return this.model.findOneAndUpdate(this.scoped(companyId, { _id: id }), payload, {
      new: true,
      runValidators: true
    });
  }

  archive(companyId, id) {
    return this.update(companyId, id, { archivedAt: new Date() });
  }

  delete(companyId, id) {
    return this.model.findOneAndDelete(this.scoped(companyId, { _id: id }));
  }
}

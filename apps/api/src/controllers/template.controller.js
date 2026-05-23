import { SlipTemplate } from "../models/SlipTemplate.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { crudController } from "./crud.factory.js";

const repo = new TenantRepository(SlipTemplate, ["name", "description"], ["format", "thermalMode", "favorite"]);

export const templates = crudController(repo, "Template");

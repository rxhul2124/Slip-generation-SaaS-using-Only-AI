import { Preset } from "../models/Preset.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { crudController } from "./crud.factory.js";

const repo = new TenantRepository(Preset, ["name", "description", "tags"], []);

export const presets = crudController(repo, "Preset");

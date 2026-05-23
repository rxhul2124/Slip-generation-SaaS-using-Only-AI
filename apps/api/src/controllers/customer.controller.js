import { Customer } from "../models/Customer.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { crudController } from "./crud.factory.js";

const repo = new TenantRepository(Customer, ["name", "contactPerson", "email", "phone", "taxNumber"], ["favorite"]);

export const customers = crudController(repo, "Customer");

import { SlipTemplate } from "../models/SlipTemplate.js";
import { TenantRepository } from "../repositories/base.repository.js";
import { crudController } from "./crud.factory.js";
import { aiService } from "../services/ai.service.js";

const repo = new TenantRepository(SlipTemplate, ["name", "description"], ["format", "thermalMode", "favorite"]);

export const templates = {
  ...crudController(repo, "Template"),
  
  async analyzeImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "fail", message: "Please upload an image file." });
      }

      // Check file size (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ status: "fail", message: "Image is too large. Maximum size is 5MB." });
      }

      // We need aiService here. We'll import it at the top.
      const elements = await aiService.extractTemplateFromImage(req.file.buffer, req.file.mimetype);
      
      res.status(200).json({
        status: "success",
        data: { elements }
      });
    } catch (err) {
      next(err);
    }
  }
};

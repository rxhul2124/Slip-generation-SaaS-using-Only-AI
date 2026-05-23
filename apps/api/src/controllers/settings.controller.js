import { Settings } from "../models/Settings.js";
import { Company } from "../models/Company.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadAsset } from "../utils/storage.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate({ company: req.companyId }, {}, { upsert: true, new: true });
  res.json({ status: "success", data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate({ company: req.companyId }, req.validated.body, {
    upsert: true,
    new: true,
    runValidators: true
  });
  await req.audit?.({ payload: req.validated.body }, settings._id.toString());
  res.json({ status: "success", data: settings });
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const asset = await uploadAsset(req.file, "packslip/logos");
  const company = await Company.findByIdAndUpdate(
    req.companyId,
    { logo: asset, "onboarding.logoUploaded": true },
    { new: true }
  );
  res.json({ status: "success", data: company });
});

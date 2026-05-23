import Stripe from "stripe";
import Razorpay from "razorpay";
import { env } from "./env.js";

export const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export const razorpay =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret
      })
    : null;

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { User } from "../models/User.model.js";
import { Category } from "../models/Category.model.js";

const defaultCategories = [
  { name: "Web Development", slug: "web-development", description: "Websites, web apps, and SaaS development", icon: "🌐", order: 1 },
  { name: "Mobile Development", slug: "mobile-development", description: "iOS and Android app development", icon: "📱", order: 2 },
  { name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and experience design", icon: "🎨", order: 3 },
  { name: "Graphic Design", slug: "graphic-design", description: "Logos, branding, and visual design", icon: "🖌️", order: 4 },
  { name: "Writing & Content", slug: "writing-content", description: "Copywriting, blogging, and content creation", icon: "✍️", order: 5 },
  { name: "Data Science & ML", slug: "data-science-ml", description: "Data analysis, machine learning, and AI", icon: "📊", order: 6 },
  { name: "Marketing & SEO", slug: "marketing-seo", description: "Digital marketing, SEO, and advertising", icon: "📈", order: 7 },
  { name: "Video & Animation", slug: "video-animation", description: "Video production, editing, and animation", icon: "🎬", order: 8 },
  { name: "Virtual Assistant", slug: "virtual-assistant", description: "Administrative and virtual support", icon: "🤝", order: 9 },
  { name: "DevOps & Cloud", slug: "devops-cloud", description: "Server management, CI/CD, and cloud infrastructure", icon: "☁️", order: 10 },
];

async function seed() {
  try {
    await connectDB();

    logger.info("🌱 Seeding database...");

    // Create superadmin
    const existingAdmin = await User.findOne({ email: env.seed.email });
    if (existingAdmin) {
      logger.info("Superadmin already exists, skipping...");
    } else {
      await User.create({
        firstName: env.seed.firstName,
        lastName: env.seed.lastName,
        email: env.seed.email,
        password: env.seed.password,
        role: "admin",
        emailVerified: true,
        status: "Active",
      });
      logger.info(`✅ Superadmin created: ${env.seed.email}`);
    }

    // Create categories
    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        logger.info(`Category "${cat.name}" already exists, skipping...`);
      } else {
        await Category.create(cat);
        logger.info(`✅ Category created: ${cat.name}`);
      }
    }

    logger.info("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    logger.error(`❌ Seeding failed: ${err.message}`);
    process.exit(1);
  }
}

seed();

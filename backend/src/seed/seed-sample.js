import { connectDB } from "../config/db.js";
import { logger } from "../config/logger.js";
import { User } from "../models/User.model.js";
import { Job } from "../models/Job.model.js";
import { Application } from "../models/Application.model.js";
import { Category } from "../models/Category.model.js";

const SAMPLE_PASSWORD = "Password@123";

const workers = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    role: "worker",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "GraphQL"],
    hourlyRate: 50,
    availability: "available",
    bio: "Full-stack developer with 6+ years of experience building scalable web applications. Passionate about clean code and great user experiences.",
    averageRating: 4.8,
    totalReviews: 12,
    completedJobs: 8,
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@example.com",
    role: "worker",
    skills: ["Figma", "Adobe XD", "Sketch", "UI Design", "Prototyping"],
    hourlyRate: 40,
    availability: "available",
    bio: "UI/UX designer specializing in SaaS platforms and mobile apps. I turn complex problems into intuitive, beautiful interfaces.",
    averageRating: 4.5,
    totalReviews: 9,
    completedJobs: 6,
  },
  {
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie@example.com",
    role: "worker",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    hourlyRate: 75,
    availability: "busy",
    bio: "DevOps engineer and cloud architect. I help companies build resilient, auto-scaling infrastructure on AWS and GCP.",
    averageRating: 5.0,
    totalReviews: 7,
    completedJobs: 5,
  },
  {
    firstName: "Diana",
    lastName: "Lee",
    email: "diana@example.com",
    role: "worker",
    skills: ["Copywriting", "SEO", "Content Strategy", "Blogging", "Technical Writing"],
    hourlyRate: 30,
    availability: "available",
    bio: "Content writer with a knack for turning technical concepts into engaging reads. SEO-optimized content that drives traffic.",
    averageRating: 4.2,
    totalReviews: 15,
    completedJobs: 12,
  },
];

const clients = [
  {
    firstName: "Alex",
    lastName: "Thompson",
    email: "alex@techcorp.com",
    role: "client",
    company: "TechCorp Inc.",
    bio: "CTO at TechCorp. Building the future of enterprise software.",
    averageRating: 4.6,
    totalReviews: 5,
    completedJobs: 3,
  },
  {
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria@designstudio.com",
    role: "client",
    company: "DesignStudio",
    bio: "Creative director at DesignStudio. Looking for top creative talent.",
    averageRating: 4.9,
    totalReviews: 8,
    completedJobs: 5,
  },
  {
    firstName: "James",
    lastName: "Wilson",
    email: "james@startupxyz.com",
    role: "client",
    company: "StartupXYZ",
    bio: "Founder of StartupXYZ. First-time founder building something exciting.",
    averageRating: 4.0,
    totalReviews: 2,
    completedJobs: 1,
  },
];

const jobDescriptions = [
  {
    title: "React Native Mobile App Development",
    description: "We're building a cross-platform mobile app for our task management SaaS. Need an experienced React Native developer to take our Figma designs and turn them into a polished iOS and Android app. Features include real-time sync, push notifications, offline support, and file attachments.\n\n**Requirements:**\n- 3+ years React Native experience\n- Experience with real-time data (WebSockets/Socket.io)\n- Push notification implementation\n- App store deployment experience",
    budgetType: "fixed",
    budgetMin: 5000,
    budgetMax: 8000,
    experienceLevel: "intermediate",
    duration: "1-3_months",
    skills: ["React Native", "TypeScript", "Socket.io", "iOS", "Android"],
    isFeatured: true,
  },
  {
    title: "E-commerce Website Redesign",
    description: "Our online store needs a complete UX/UI overhaul. We currently run on Shopify and want a modern, conversion-optimized design. The project includes redesigning product pages, cart flow, checkout process, and mobile responsiveness.\n\n**Deliverables:**\n- Complete Figma design system\n- All page mockups (mobile + desktop)\n- Interactive prototype\n- Design implementation guidelines",
    budgetType: "fixed",
    budgetMin: 3000,
    budgetMax: 5000,
    experienceLevel: "intermediate",
    duration: "1-4_weeks",
    skills: ["Shopify", "Figma", "UI Design", "E-commerce", "Responsive Design"],
  },
  {
    title: "SaaS Dashboard UI Design",
    description: "We need a world-class designer to redesign our analytics dashboard. The current UI is cluttered and our users struggle to find key metrics. We need clean data visualizations, intuitive navigation, and a professional look.\n\n**Must have:**\n- Strong portfolio of data-heavy interfaces\n- Experience with dashboard design\n- Understanding of data visualization best practices",
    budgetType: "hourly",
    budgetMin: 40,
    budgetMax: 60,
    experienceLevel: "expert",
    duration: "1-3_months",
    skills: ["Dashboard Design", "Data Visualization", "Figma", "UI Design", "Design Systems"],
  },
  {
    title: "Company Logo & Brand Identity",
    description: "StartupXYZ needs a complete brand identity. We're launching next quarter and need a logo, color palette, typography system, and basic brand guidelines. We want something modern and memorable.\n\n**Scope:**\n- Primary logo (horizontal + icon)\n- Color palette with HEX codes\n- Font pairings\n- 1-page brand guidelines PDF\n- Business card mockup",
    budgetType: "fixed",
    budgetMin: 500,
    budgetMax: 1000,
    experienceLevel: "entry",
    duration: "less_than_week",
    skills: ["Logo Design", "Branding", "Typography", "Adobe Illustrator", "Brand Guidelines"],
  },
  {
    title: "10 SEO-Optimized Blog Posts for SaaS Blog",
    description: "We need 10 blog posts (1500-2000 words each) for our B2B SaaS blog. Topics include productivity tips, remote work best practices, and team collaboration guides. All posts must be SEO-optimized with proper keyword research.\n\n**Requirements:**\n- Excellent English writing skills\n- SEO knowledge (keyword placement, meta descriptions, headers)\n- Ability to write in a professional but approachable tone\n- Must provide writing samples",
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 35,
    experienceLevel: "entry",
    duration: "1-4_weeks",
    skills: ["SEO Writing", "Content Strategy", "Keyword Research", "B2B Writing", "Blogging"],
  },
  {
    title: "AWS Infrastructure Setup & Migration",
    description: "We're moving our monolithic application to a microservices architecture on AWS. Need an experienced DevOps engineer to set up EKS clusters, configure CI/CD pipelines, and migrate our databases.\n\n**Technical requirements:**\n- AWS EKS/Kubernetes\n- Terraform infrastructure as code\n- GitHub Actions CI/CD\n- RDS and ElastiCache migration\n- Monitoring with CloudWatch and Datadog",
    budgetType: "hourly",
    budgetMin: 60,
    budgetMax: 80,
    experienceLevel: "expert",
    duration: "1-3_months",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker", "DevOps"],
    isFeatured: true,
  },
  {
    title: "Social Media Marketing Campaign",
    description: "We're launching a new product feature and need a social media marketing campaign to promote it. This includes creating a content calendar, designing social graphics, writing copy, and managing the campaign across LinkedIn, Twitter, and Instagram.\n\n**Deliverables:**\n- 4-week content calendar\n- 12 social media graphics\n- 20+ post copies\n- Campaign performance report",
    budgetType: "fixed",
    budgetMin: 2000,
    budgetMax: 3000,
    experienceLevel: "intermediate",
    duration: "1-4_weeks",
    skills: ["Social Media Marketing", "Content Creation", "Copywriting", "LinkedIn", "Instagram"],
  },
  {
    title: "Product Explainer Video Production",
    description: "We need a 60-90 second animated explainer video for our SaaS product homepage. The video should explain what our product does, who it's for, and why it's different. We have a script ready and need animation + voiceover.\n\n**Must include:**\n- 2D animation\n- Professional voiceover (English)\n- Background music\n- Captions\n- 2 rounds of revisions",
    budgetType: "fixed",
    budgetMin: 1500,
    budgetMax: 2500,
    experienceLevel: "intermediate",
    duration: "1-4_weeks",
    skills: ["2D Animation", "Video Editing", "Voiceover", "Motion Graphics", "After Effects"],
  },
];

const applicationData = [
  // Worker 0 (Alice) applied to:
  { workerIdx: 0, jobIdx: 0, coverLetter: "I've built 3 React Native apps that are currently in production on both app stores. My experience with real-time sync using Socket.io is directly applicable to your task management app. I'd love to discuss your project in detail!", proposedRate: null, status: "pending" },
  { workerIdx: 0, jobIdx: 1, coverLetter: "I recently redesigned a Shopify store that saw a 40% increase in conversion rate. I'd bring that same data-driven approach to your e-commerce redesign project.", proposedRate: null, status: "accepted" },
  // Worker 1 (Bob) applied to:
  { workerIdx: 1, jobIdx: 2, coverLetter: "I specialize in designing data-heavy dashboards. My recent project for a fintech startup involved designing 30+ data visualization screens. I'd love to bring that expertise to your SaaS dashboard.", proposedRate: 55, status: "pending" },
  { workerIdx: 1, jobIdx: 3, coverLetter: "Brand identity is my passion. I'd love to help StartupXYZ create a memorable brand that stands out. Here's my portfolio: behance.net/bobsmith", proposedRate: null, status: "shortlisted" },
  // Worker 2 (Charlie) applied to:
  { workerIdx: 2, jobIdx: 5, coverLetter: "I've migrated 5+ monolithic applications to microservices on AWS EKS. I'm currently wrapping up a similar migration and could start in 2 weeks. Let me know if you'd like to discuss the architecture.", proposedRate: 70, status: "accepted" },
  // Worker 3 (Diana) applied to:
  { workerIdx: 3, jobIdx: 4, coverLetter: "I've written 200+ SEO-optimized blog posts for B2B SaaS companies. My content has helped clients achieve top-10 rankings for competitive keywords. I can send writing samples upon request.", proposedRate: null, status: "pending" },
  { workerIdx: 3, jobIdx: 6, coverLetter: "I have experience creating social media content for tech companies. However, I realize this project may need more design-focused skills than I offer. Still interested in discussing if there's a writing component.", proposedRate: null, status: "rejected" },
];

async function seedSample() {
  try {
    await connectDB();
    logger.info("🌱 Seeding sample data...");

    // Clear existing sample data (users with @example.com, @techcorp.com, etc.)
    const sampleEmails = [
      ...workers.map((w) => w.email),
      ...clients.map((c) => c.email),
    ];
    const sampleUserIds = (await User.find({ email: { $in: sampleEmails } }).select("_id")).map((u) => u._id);

    await Promise.all([
      Application.deleteMany({ worker: { $in: sampleUserIds } }),
      User.deleteMany({ email: { $in: sampleEmails } }),
      Job.deleteMany({ title: { $in: jobDescriptions.map((j) => j.title) }}),
    ]);
    logger.info("Cleared existing sample data");

    // Get categories for job association
    const categories = await Category.find({ isActive: true });
    const catMap = {};
    categories.forEach((cat) => {
      if (cat.slug === "web-development") catMap.web = cat._id;
      if (cat.slug === "ui-ux-design") catMap.uiux = cat._id;
      if (cat.slug === "graphic-design") catMap.graphic = cat._id;
      if (cat.slug === "writing-content") catMap.writing = cat._id;
      if (cat.slug === "devops-cloud") catMap.devops = cat._id;
      if (cat.slug === "marketing-seo") catMap.marketing = cat._id;
      if (cat.slug === "video-animation") catMap.video = cat._id;
    });

    const categoryForJob = (idx) => {
      const map = [catMap.web, catMap.web, catMap.uiux, catMap.graphic, catMap.writing, catMap.devops, catMap.marketing, catMap.video];
      return map[idx] || undefined;
    };

    // Create workers
    const createdWorkers = await User.create(
      workers.map((w) => ({ ...w, password: SAMPLE_PASSWORD, emailVerified: true, status: "Active" }))
    );
    logger.info(`✅ Created ${createdWorkers.length} workers`);

    // Create clients
    const createdClients = await User.create(
      clients.map((c) => ({ ...c, password: SAMPLE_PASSWORD, emailVerified: true, status: "Active" }))
    );
    logger.info(`✅ Created ${createdClients.length} clients`);

    // Create jobs
    const jobsToCreate = jobDescriptions.map((jd, idx) => ({
      ...jd,
      client: createdClients[idx % createdClients.length]._id,
      category: categoryForJob(idx),
      status: jd.title.includes("Infrastructure") || jd.title.includes("E-commerce") ? "in_progress" : "open",
      hiredWorker: null,
    }));

    const createdJobs = await Job.create(jobsToCreate);
    logger.info(`✅ Created ${createdJobs.length} jobs`);

    // Create applications
    const applicationsToCreate = applicationData.map((app) => ({
      job: createdJobs[app.jobIdx]._id,
      worker: createdWorkers[app.workerIdx]._id,
      coverLetter: app.coverLetter,
      proposedRate: app.proposedRate,
      status: app.status,
    }));

    const createdApplications = await Application.create(applicationsToCreate);
    logger.info(`✅ Created ${createdApplications.length} applications`);

    // Update jobs with application counts + hiredWorker for accepted apps
    const acceptedApps = await Application.find({ status: "accepted" }).populate("worker");
    for (const app of acceptedApps) {
      // Set hiredWorker + app count on the job
      await Job.findByIdAndUpdate(app.job, {
        $inc: { applicationsCount: 1 },
        hiredWorker: app.worker._id,
      });
      // Increment worker's completed jobs
      await User.findByIdAndUpdate(app.worker._id, { $inc: { completedJobs: 1 } });
    }

    // Update application counts for remaining jobs (those without accepted apps)
    const acceptedJobIds = acceptedApps.map((a) => a.job.toString());
    for (const job of createdJobs) {
      if (!acceptedJobIds.includes(job._id.toString())) {
        const count = await Application.countDocuments({ job: job._id });
        if (count > 0) {
          await Job.findByIdAndUpdate(job._id, { applicationsCount: count });
        }
      }
    }
    logger.info("✅ Updated job application counts + hired workers");

    logger.info("🎉 Sample data seeding complete!");
    logger.info(`   Login credentials for all sample users: Password@123`);
    logger.info(`   Workers: alice@example.com, bob@example.com, charlie@example.com, diana@example.com`);
    logger.info(`   Clients: alex@techcorp.com, maria@designstudio.com, james@startupxyz.com`);
    process.exit(0);
  } catch (err) {
    logger.error(`❌ Sample data seeding failed: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
}

seedSample();

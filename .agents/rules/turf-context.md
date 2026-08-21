---
trigger: always_on
---

@Final_prd.html @DESIGN.md @.agents/rules/turf-context.md @.agents/skills/web-design-guidelines/SKILL.md

Act as my Senior Lead Engineer. We are building the Turf Booking Platform MVP. 

Our basic Next.js, Tailwind, and Drizzle project skeleton is already initialized in the workspace. Before writing any new features, I need you to completely align with our architecture. Please read the attached PRD, our design guidelines, and the workspace rules.

Once you have reviewed the context, please execute the following:
1. Verify our current setup: Check our existing `drizzle.config.ts`, `components.json`, and folder structure to ensure they fully support our "100% Supabase Native" approach and our design system.
2. Formulate the Action Plan: Based on the PRD, outline the first 3 specific coding tasks we need to complete right now to build the Interactive Slot Matrix UI and the Supabase database connection.
3. Git Sync: Provide the exact terminal commands to stage all our current files, create an initial commit ("Initial commit: MVP scaffolding, design guidelines, and AI agent skills"), and push this to our newly created GitHub repository so my co-founder can clone it.

## Current Status / Handoff
* **Backend Setup**: Complete. Drizzle schema, multi-ground support, and parent-child booking constraints are fully implemented. RLS policies and the transactional booking RPC database function are deployed. Local Supabase CLI has been configured and the local Docker DB has been seeded with 952 slots across 3 Ratlam venues.
* **Auth & Webhooks**: Fast2SMS integration is implemented via Supabase Edge Functions. It is currently configured to gracefully handle KYC locks by returning 200 Success so local dev flows are unblocked (OTP can be read from docker logs).
* **UI Integration**: Complete. The TurfSync Landing Page and Interactive Slot Matrix UI components have been successfully integrated with Tailwind v4 custom tokens.
* **Owner Dashboard**: The "Live Calendar", "Grounds & Setup" (Grounds Manager), and "Customers" (CRM) panels are fully functional and integrated with the database. 

## Current Task
Shift to the frontend to build the **Dynamic Pricing Engine (Off-Peak Rule Setup)** in the owner dashboard (`/dashboard/pricing`). This module will allow owners to define rules like "Mon–Fri, 11 AM – 4 PM = ₹500/hr".
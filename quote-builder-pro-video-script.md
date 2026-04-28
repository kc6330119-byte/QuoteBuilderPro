# QuoteBuilder Pro Demo Video Script

## Purpose

Create a short product walkthrough that shows how QuoteBuilder Pro helps a service business turn website visitors into quote-ready leads.

Target length: 4 to 5 minutes.

Recording style: calm founder walkthrough, not a hard sales pitch.

Primary audience: contractors, remodelers, rolloff rental operators, landscapers, home service businesses, and small business owners who want more qualified leads from their website.

## Recording Prep

- Use demo-safe data only.
- Published demo video asset: `https://res.cloudinary.com/dnmrgvjdm/video/upload/v1777385200/QuoteBuilderProFinal_cmnqsq.mp4`
- Avoid opening Clerk, Netlify, Neon, GitHub, account menus, API keys, environment variables, or browser password prompts.
- If your email appears in the dashboard sidebar, crop it out or keep the mouse away from the account area.
- Use a published demo calculator, preferably Rolloff Container Rental or General Contractor / Home Builder.
- Have one clean test lead ready, or submit one during the recording.

## Suggested Opening Line

"In this video, I want to show you QuoteBuilder Pro, a simple SaaS tool that lets a service business create quote calculators, publish them on a website, and turn quote requests into follow-up leads."

## Scene 1: Homepage

Screen: `https://quote-builder-pro.com/`

Action:

- Start on the homepage.
- Slowly scroll just enough to show the hero, benefits, and navigation.
- Click or point to the primary value proposition.

Narration:

"QuoteBuilder Pro is built for service businesses that get a lot of pricing questions before a customer is ready to talk. Instead of sending people to a generic contact form, the business can give visitors an interactive estimate calculator."

"The goal is not to replace the final quote. The goal is to help the customer understand a likely range, then capture a qualified lead the business can follow up with."

Key point:

"More useful than a contact form, easier than building a custom calculator from scratch."

## Scene 2: Sign In And Dashboard

Screen: Dashboard after login.

Action:

- Click Dashboard or navigate to `/dashboard`.
- Show the dashboard stats and recent leads.

Narration:

"Once the business owner logs in, they land on a private dashboard. This is where calculators, templates, leads, and setup guidance live."

"The dashboard gives a quick snapshot of published calculators, lead submissions, and estimated pipeline value. As leads come in from public quote pages or embedded calculators, they show up here."

Key point:

"The business owner has a private workspace. Customers do not log into the dashboard."

## Scene 3: Templates

Screen: `/dashboard/templates`

Action:

- Open Templates.
- Show the template cards.
- Highlight Rolloff Container Rental and General Contractor / Home Builder.

Narration:

"To make setup easier, QuoteBuilder Pro includes starter templates. A template gives the business a working calculator structure that can be customized instead of starting from a blank page."

"For example, a contractor can start with the home builder template, while a rolloff business can start with the container rental template."

"The template is not locked. It is just a fast starting point."

Action:

- Click "Use Template" only if you want to create a fresh demo calculator during the recording.
- Otherwise, open an existing calculator from the Calculators page.

## Scene 4: Calculator List

Screen: `/dashboard/calculators`

Action:

- Show calculator cards.
- Point out Draft vs Published.
- Open a calculator by clicking Manage.

Narration:

"The calculator list shows each calculator, whether it is still a draft or already published, and how many leads it has captured."

"Draft calculators can be edited and previewed privately. Published calculators are available on public quote pages and can be embedded on the business website."

Key point:

"Draft means private. Published means customer-facing."

## Scene 5: Guided Calculator Builder

Screen: `/dashboard/calculators/[id]`

Action:

- Show the top calculator status area.
- Show the Builder coach section.
- Point to the checklist and next-best-step panel.

Narration:

"This is the calculator editor. The important part is that the business owner does not need to think like a database designer."

"The Builder coach guides the setup process. It checks whether the calculator has customer questions, a starting price, rules that affect pricing, and whether it has been published."

"The idea is to build the calculator like a sales conversation: ask the first broad question, branch into follow-up details when needed, and add pricing rules for the answers that change the estimate."

Key point:

"The builder is designed to feel like creating a customer interview, not configuring a spreadsheet."

## Scene 6: Questions And Branching

Screen: Questions section in calculator editor.

Action:

- Show an existing question.
- Show "Show/hide logic."
- If using a remodel calculator, explain kitchen/bathroom branching.
- If using rolloff rental, explain dumpster size, rental length, delivery distance, or extra tonnage.

Narration:

"Questions are what the customer sees on the public quote form. A select question works well for choices, a number question works well for quantities, and a checkbox works well for optional add-ons."

"The show/hide logic is what makes the calculator feel smarter. For example, if a customer chooses Kitchen Remodel, then the calculator can show kitchen-specific follow-up questions. If they choose Bathroom Remodel, it can show a different set of questions."

"For a rolloff rental business, the same idea applies. A customer might choose a container size first, then answer follow-up questions about rental days, delivery distance, or debris type."

Key point:

"Ask only what matters based on the customer's earlier answers."

## Scene 7: Pricing Rules

Screen: Pricing rules panel.

Action:

- Show the dark pricing rules area.
- Point to base price, option price, quantity multiplier, and checkbox add-on.

Narration:

"Pricing rules are how the calculator estimates a price."

"A base price starts every quote with a minimum amount."

"An option price adds a fixed amount when a customer picks a specific answer."

"A quantity multiplier takes a number answer and multiplies it by an amount. That is useful for things like rental days, square footage, number of rooms, or miles."

"A checkbox add-on adds a price when the customer selects an extra service."

"The estimate is meant to be helpful, not legally binding. The business still reviews the lead and gives the final quote."

Key point:

"Simple rules create useful estimates without custom code."

## Scene 8: Preview Flow

Screen: Protected preview route from the editor.

Action:

- Click Preview flow or Preview draft.
- Walk through the calculator as if you are a customer.
- Change an answer and show the estimated price update.

Narration:

"Before publishing, the owner can preview the calculator privately. This lets them test the customer experience without making the calculator public yet."

"As answers change, the estimated price updates live. That gives the customer immediate feedback and helps them understand the cost drivers."

Key point:

"Preview before publishing, just like testing a form before putting it on a real website."

## Scene 9: Public Quote Page

Screen: `/quote/[slug]` for a published calculator.

Action:

- Open the public quote page.
- Fill out the quote form using demo customer information.
- Show the disclaimer and consent checkbox.
- Submit the quote request.

Narration:

"Once the calculator is published, customers can use the public quote page. They answer the questions, see the estimated price, and submit their contact details."

"The form includes a clear disclaimer that the estimate is not a final binding quote. The business still follows up, verifies the details, and decides the final price."

"After the customer submits, the lead is saved for the business owner."

Suggested demo customer:

- Name: Demo Customer
- Email: demo@example.com
- Phone: 555-0100
- Notes: "Testing the quote flow for a demo video."

## Scene 10: Leads Page

Screen: `/dashboard/leads`

Action:

- Return to dashboard leads.
- Show the new lead.
- Show estimated price, answers summary, contact info, and status controls.

Narration:

"Back in the dashboard, the submitted quote request appears as a lead. The business can see who submitted it, which calculator it came from, the estimated price, and a summary of the answers."

"The owner can update the lead status as they follow up: new, contacted, won, or lost."

Key point:

"This turns anonymous website traffic into a structured lead pipeline."

## Scene 11: Embed Code

Screen: Calculator editor embed section.

Action:

- Scroll to the Embed Code section.
- Show the script snippet and iframe preview.
- Do not copy/paste into another site unless you want to show that workflow.

Narration:

"The business does not have to send customers away to a separate page. Published calculators can also be embedded on the company's own website with a simple script snippet."

"That means a contractor, remodeler, or rolloff business can place the quote calculator directly on a service page, landing page, or request-a-quote page."

Key point:

"Public quote page for sharing. Embed code for placing it on the customer's existing website."

## Scene 12: Closing

Screen: Dashboard or homepage.

Action:

- End on dashboard or homepage.

Narration:

"That is the core workflow: create or start from a template, customize the questions and pricing rules, preview the calculator, publish it, collect quote requests, and manage the leads."

"For a service business, the value is simple: give customers a better way to estimate the job, and give the business owner a better lead to follow up with."

"This is QuoteBuilder Pro."

## Short Version Script

Use this if you want a faster 60 to 90 second version.

"QuoteBuilder Pro helps service businesses turn website visitors into quote-ready leads."

"A business owner can log in, start with a template, customize the questions and pricing rules, and preview the calculator before publishing."

"The calculator behaves like a guided customer interview. It can ask broad questions first, then show follow-up questions only when they matter."

"Pricing rules create a live estimate using base prices, option prices, checkbox add-ons, and quantity multipliers."

"Once published, the calculator can be shared as a public quote page or embedded directly on the business website."

"When a customer submits the quote form, the business owner gets a lead with contact details, the estimated price, and a summary of the customer's answers."

"The estimate is non-binding, so the business can still review the job and provide the final quote."

"That is QuoteBuilder Pro: interactive quote calculators, embedded on a website, connected to a simple lead dashboard."

## Shot Checklist

- Homepage hero
- Dashboard overview
- Templates page
- Calculator list with Draft and Published examples
- Guided calculator editor
- Show/hide logic on questions
- Pricing rules panel
- Protected preview flow
- Published public quote page
- Quote submission confirmation
- Dashboard leads page
- Embed code section

## Notes For Recording

- Record at 1080p or higher.
- Zoom browser to 90 percent or 100 percent depending on readability.
- Hide bookmarks bar if it distracts.
- Keep browser tabs minimal.
- Avoid showing real customer data.
- If using a screen recorder, record system audio only if needed. Voiceover after recording is often cleaner.

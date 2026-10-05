import type { CaseStudy } from "./order-desk";

// Case study from Figma "Making aurora" › "Order desk admin" (409:35831).
// Panels are 2× exports of the Figma frames, masked to their card shapes and
// encoded as WebP.

const dir = "/work/order-desk-admin";

export const orderDeskAdmin: CaseStudy = {
  slug: "designing-the-core-operations-for-a-growing-customer-platform",
  title: "Designing the core operations for a growing customer platform",
  blocks: [
    {
      type: "image",
      src: `${dir}/hero.webp`,
      width: 600,
      height: 420,
      alt: "The Order Desk Admin dashboard: imagery awaiting capture, processing and delivery, progress charts and average delivery time, over an aerial landscape",
    },
    {
      type: "intro",
      paragraphs: [
        "A customer places an order. Somewhere in that moment, a satellite gets scheduled, a task drops into a queue, imagery gets checked for cloud cover and quality, and a dozen small judgment calls get made about whether it can be captured, and when, and by whom.",
        "The customer never sees any of this. To them, the order is placed — the rest is Pixxel’s problem now.",
        "But “Pixxel’s problem” was really several teams’ problems, each holding a different piece of it. Operations knew whether a satellite could actually make the pass. Customer Success knew whether the customer was still confident or starting to worry. Engineering knew what the system could tell them, and what it couldn’t.",
        "None of them were looking at the same picture. Their answers lived in different spreadsheets, different tools, different Slack threads — and stitching them together, order by order, was work someone had to do by hand.",
        "The customer saw one platform. Behind it, the teams supporting them saw fragments. Order Desk Admin started as an answer to a simple, uncomfortable question: if the front door was this clear, why was everything behind it still scattered?",
      ],
    },
    {
      type: "image",
      src: `${dir}/overview.webp`,
      width: 600,
      height: 366,
      alt: "Order Desk Admin screens: an order's capture over its area on a map, its activity, tasks and the orders list",
    },
    {
      type: "section",
      heading: "The Bridge",
      body: [
        "Order Desk Admin became the operational layer behind Order Desk. It brought together the information teams needed to manage organizations, follow orders, monitor tasks, inspect imagery, understand changes, and support customers throughout the ordering journey.",
        "The intention wasn’t to expose everything happening behind the scenes.\nIt was to give the teams behind Order Desk the right context to understand what was happening and act on it.",
      ],
    },
    {
      type: "section",
      heading: "The Start",
      body: [
        "Getting there wasn’t going to be simple.",
        "Admin touched every team that kept Order Desk running — Operations, Engineering, Customer Success — and each of them had spent months living inside the gaps of how things actually worked. This wasn’t a small internal tool. It was the thing that had to hold the operational side of the business together.",
      ],
    },
    {
      type: "teams",
      teams: [
        { label: "Operations", mark: "operations" },
        { label: "Customer success", mark: "customer-success-diamond" },
        { label: "Engineering", mark: "engineering" },
      ],
    },
    {
      type: "section",
      flush: true,
      body: [
        "So we began the way most hard problems get untangled — by getting everyone into the same room to name what wasn’t working, and why.",
        {
          callout:
            "The challenge? Building a platform that could carry that weight without becoming one more system for those same teams to learn.",
        },
      ],
    },
    {
      type: "section",
      heading: "Decoding the current scenario",
      divider: true,
      body: [
        "We worked closely with Customer Success and the teams who supported orders day to day. Together we walked through real scenarios and mapped the spreadsheets, internal tools, data structures and hand-offs that kept the process running. We also talked to the teams who owned those systems to learn where the data came from and how it was kept up to date.",
        "The deeper we went, the more scattered it looked. Organization details sat in one place and orders in another. Tasks ran on their own workflow. Image-level details took more digging, and when something was unclear, the answer usually sat with another team.",
      ],
    },
    {
      type: "image",
      src: `${dir}/scattered.webp`,
      width: 600,
      height: 366,
      alt: "Order parameters as set in Order Desk: areas of interest drawn on the map, capture window, cloud cover and processing level",
    },
    {
      type: "section",
      flush: true,
      body: [
        { callout: "The information wasn’t missing. The connections were." },
        "Once the pieces were mapped, we looked for a structure that could tie them together. Five core objects ran through the whole lifecycle:",
        "Organization → Order → Task → Capture → Image",
        "Compliance, payments, processing, delivery and support all run around these objects.",
        {
          callout:
            "One question guided us throughout: what does a team need to know to make the next decision? That question became the foundation of the Admin experience.",
        },
        "That became the foundation for how we structured the Admin experience.",
      ],
    },
    {
      type: "image",
      src: `${dir}/who-holds-what.webp`,
      width: 600,
      height: 450,
      alt: "Current state — who holds what: Google Sheets, the GSS and IPR teams each keep their own data, and Customer Success gathers it all by hand for the customer",
    },
    {
      type: "section",
      heading: "Making it central",
      body: [
        "The challenge wasn’t simply to centralize information. If we put everything into one place, we’d risk creating a different problem — too much information, not enough clarity. So we focused on giving teams enough depth to investigate, while keeping the experience clear enough to act on.",
      ],
    },
    {
      type: "section",
      level: 3,
      heading: "Put the organization in one place",
      body: [
        "An organization wasn’t just a customer record. It contained the context that shaped everything that happened next — configuration, contract and orders. Previously, managing this information could involve spreadsheets and backend dependencies. We brought it together into a single organization view, allowing Customer Success to understand the organization, make relevant changes, and immediately see the orders connected to it. The organization became the starting point for understanding the customer.",
      ],
    },
    {
      type: "image",
      src: `${dir}/tasks.webp`,
      width: 600,
      height: 366,
      alt: "The tasks screen: a task list with adjustable priorities beside a task's parameters and its place on the timeline",
    },
    {
      type: "section",
      level: 3,
      heading: "Manage all the tasks at one place",
      body: [
        "Tasks were also brought together. The tasks screen lets the team see progress across all work, adjust priorities, extend deadlines when needed, and review the captures linked to each task. This gives them a clear sense of what is on track and what needs attention, so they can answer customer questions with accurate, up-to-date information.",
      ],
    },
    {
      type: "image",
      src: `${dir}/images.webp`,
      width: 600,
      height: 366,
      alt: "Image management: every image with its status, a capture strip over the AOI on a map, and an image's parameters",
    },
    {
      type: "section",
      level: 3,
      heading: "Assess all the image level status of the orders",
      body: [
        "As we followed the lifecycle deeper, we realized that an order-level status wasn’t always enough. The real question was often: Is the imagery actually usable?",
        "We therefore designed visibility at the image level — showing capture time, cloud coverage, processing status, output quality, reprocessing requirements, and whether the captured strip covered the requested AOI.",
        "The team could now understand the state of the imagery without waiting for another team to interpret it. More visibility meant fewer hand-offs.",
        { callout: "The goal was simple: reduce the number of places people needed to look." },
      ],
    },
    {
      type: "section",
      heading: "Making it clear",
      body: [
        "Centralizing information was only the beginning. The next challenge was helping people understand what had happened, what was happening, and what needed attention.",
      ],
    },
    {
      type: "image",
      src: `${dir}/activity-log.webp`,
      width: 600,
      height: 366,
      alt: "An order's activity log: refunds, cancellations, parameter changes and who made them",
    },
    {
      type: "section",
      level: 3,
      heading: "Make the journey traceable",
      body: [
        "When something went wrong, knowing the current state wasn’t always enough. We needed to understand how it got there.",
        "The activity view brought the history of an order into one place — from its creation through parameter changes and subsequent updates.",
        "Who changed it? What changed? When did it happen?",
        "Instead of reconstructing the story through Slack messages or conversations with other teams, the order itself could tell the story. The history became part of the context.",
      ],
    },
    {
      type: "image",
      src: `${dir}/insights.webp`,
      width: 600,
      height: 366,
      alt: "Insights: 56 orders sliced by status, with counts for each stage from planning to delivered",
    },
    {
      type: "section",
      level: 3,
      heading: "Analyse all the activities taking place in each screen",
      body: [
        "While detailed screens helped answer specific questions, Customer Success also needed to understand what was happening across the system.",
        "We introduced an Insights layer to provide that broader perspective.",
        "Instead of moving through individual organizations, orders, tasks, and images, the team could step back and understand overall activity, identify patterns, and spot areas that needed attention.",
        { callout: "The interface moved from showing information to helping the team interpret it." },
      ],
    },
    {
      type: "image",
      src: `${dir}/timeline.webp`,
      width: 600,
      height: 366,
      alt: "Task prioritisation timeline: tasks laid against dates, with due dates and overlaps",
    },
    {
      type: "section",
      level: 3,
      heading: "Not every image needs to be captured",
      body: [
        "Some operational questions aren’t about what is happening. They’re about when.",
        "A list of tasks could tell us what existed, but it didn’t easily show what was approaching, what was active, or where deadlines were beginning to overlap. We explored a timeline view that placed tasks against time, giving the team a visual understanding of ongoing and upcoming work.",
        "What was once a long list became a clearer picture — what needs attention now, and what’s coming next.",
      ],
    },
    {
      type: "section",
      heading: "From fragmented workflows to shared context",
      body: [
        "Order Desk was designed to make ordering satellite imagery simpler for customers.",
        "Order Desk Admin had a different responsibility. It needed to make the complexity behind that experience easier for the teams responsible for keeping it moving.",
        {
          callout:
            "The goal was never to remove the complexity from the business. It was to absorb it into the system.",
        },
        "So teams could spend less time finding information, coordinating across systems, and reconstructing what happened — and more time understanding the customer and making the next decision.",
        { callout: "The complexity stayed behind the interface. The context came together in one place." },
      ],
    },
  ],
};

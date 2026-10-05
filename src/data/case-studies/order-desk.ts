import type { TeamMarkName } from "@/components/case-study/TeamMark";

// Case study from Figma "Making aurora" › "Case study – Order Desk (restyled)"
// (381:20543). Panels are 2× exports of the Figma frames, encoded as WebP.

export type Para = string | { callout: string; tone?: "secondary" };

export type Block =
  | { type: "image"; src: string; width: number; height: number; alt: string }
  | { type: "intro"; paragraphs: string[] }
  | {
      type: "section";
      /** h2 sections sit 48px below the previous block; h3 groups are tight. */
      level?: 2 | 3;
      heading?: string;
      /** Hairline rule above the section. */
      divider?: boolean;
      /** Continues the previous section: no 48px lead-in. */
      flush?: boolean;
      body: Para[];
    }
  | { type: "teams"; teams: { label: string; mark: TeamMarkName }[] }
  | { type: "compare"; items: { label: string; src: string; alt: string }[] };

export type CaseStudy = { slug: string; title: string; blocks: Block[] };

const dir = "/work/order-desk";

export const orderDesk: CaseStudy = {
  slug: "crafting-a-simpler-way-to-order-image-from-space",
  title: "Crafting a simpler way to order imagery from space",
  blocks: [
    {
      type: "image",
      src: `${dir}/hero.webp`,
      width: 600,
      height: 420,
      alt: "Order Desk showing an order's area of interest on a map with its details panel, over an aerial landscape",
    },
    {
      type: "intro",
      paragraphs: [
        "Satellite imagery is incredibly powerful, but getting the right image isn't as simple as searching and clicking download.",
        "A customer needs to define where they want to look, what they need to capture, and when they need it. Behind those decisions are satellite capabilities, acquisition constraints, pricing, operations, and delivery.",
        "Pixxel has always operated through two core sides of the same mission. One side builds the satellites — designing, assembling, testing, and preparing them for orbit. The other side builds Aurora, the geospatial platform where people actually work with the imagery those satellites capture.",
        "As the company prepared for the commercial launch of its satellites and began serving customers around the world, a clear gap appeared. There was no dedicated place for customers to discover, configure, order, and receive Pixxel’s imagery with confidence.",
      ],
    },
    {
      type: "image",
      src: `${dir}/order-desk-overview.webp`,
      width: 600,
      height: 294.5,
      alt: "Order Desk screens: order details on a map, area-of-interest options, archive results and the catalog",
    },
    {
      type: "section",
      heading: "The Bridge",
      body: [
        "Order Desk became the unified ordering and fulfilment experience for Pixxel’s satellite imagery. It is the place where customers can discover both tasking and archive imagery, set their acquisition requirements, check feasibility and pricing in real time, complete payment, track their orders, and receive the data — whether through Aurora, APIs, or directly into their own cloud storage.",
      ],
    },
    {
      type: "section",
      heading: "The Start",
      body: [
        "Building it was never a quiet process. This was one of the largest and most critical projects the company had taken on, and nearly every team had a stake in the outcome.",
      ],
    },
    {
      type: "teams",
      teams: [
        { label: "Operations", mark: "operations" },
        { label: "Customer success", mark: "customer-success" },
        { label: "Engineering", mark: "engineering" },
        { label: "Business", mark: "business" },
      ],
    },
    {
      type: "section",
      body: [
        "We began by bringing everyone together to understand the project's requirements and align on expectations. The challenge? finding the point where all of these perspectives and expectations could coexist without making the product feel like a control room.",
        {
          callout:
            "Finding the point where all of these perspectives and expectations could coexist without making the product feel like a control room.",
        },
      ],
    },
    {
      type: "section",
      heading: "How we progressed",
      body: [
        "For a couple of weeks we studied how existing platforms like SkyFi and Planet Labs structured their ordering flows. For understanding the patterns and technical details that need to go into that already felt familiar to the people we hoped to serve.",
      ],
    },
    {
      type: "compare",
      items: [
        { label: "Skyfi", src: `${dir}/skyfi.webp`, alt: "SkyFi's new-image order form next to a satellite map" },
        { label: "Planet labs", src: `${dir}/planet-labs.webp`, alt: "Planet Labs' imagery filters next to a satellite map" },
      ],
    },
    {
      type: "section",
      body: [
        "The early weeks were full of long discussions and constant iteration. Every conversation seemed to send us back to the drawing board as different teams brought their own constraints and priorities.",
        "With all the discussions it was clear that we were marching towards one goal i.e",
        { callout: "Create a scalable and easy to use system", tone: "secondary" },
        "Post several weeks of discussion and iterations this is what came out of the cocoon and was ready to spread its wings.",
      ],
    },
    {
      type: "section",
      heading: "Design for scale",
      body: [
        "Space technology doesn't stand still. New satellites bring new capabilities, requirements change, and features that exist today may no longer be relevant tomorrow. We needed to design Order Desk as a system that could evolve with this constantly changing landscape—allowing new capabilities and requirements to be added, changed, or removed without disrupting the experience.",
        {
          callout:
            "The goal was to create a system that was flexible enough to adapt, structured enough to remain consistent, and scalable enough to keep growing",
        },
      ],
    },
    {
      type: "image",
      src: `${dir}/design-for-scale.webp`,
      width: 600,
      height: 294.5,
      alt: "Areas of interest drawn as a circle and a rectangle on a map, with shape tools and order parameters",
    },
    {
      type: "section",
      level: 3,
      heading: "Let users define what they need.",
      body: [
        "The Area of Interest (AOI) is the first interaction users have with Order Desk—it defines where they want to capture imagery.",
        "Since real-world areas rarely fit neat rectangles, users can draw polygons/ adjust any existing shapes, mark precise points, or upload shape-files to define irregular or multiple sites. The system then converts these inputs into the geometry required for acquisition.",
      ],
    },
    {
      type: "image",
      src: `${dir}/aoi.webp`,
      width: 600,
      height: 270.5,
      alt: "Several areas of interest on a map with a warning that they are too far apart to capture together",
    },
    {
      type: "section",
      level: 3,
      heading: "Making invisible constraints visible",
      body: [
        "Defining an area was only the beginning. The next question was whether those areas could actually be captured together.",
        "An order can cover up to 5,000 sq. km, either as a single area or combined across multiple polygons, with a constraint of multiple areas needing to be within 200 sq. km of each other.",
        "Instead of exposing these operational constraints, we surfaced them directly during AOI plotting—turning a complex acquisition constraint into simple, actionable feedback that helps users adjust their order before moving forward.",
      ],
    },
    {
      type: "section",
      heading: "Making it Simple",
      body: [
        "We focused on removing friction so users could move through the process with clarity instead of hesitation.",
      ],
    },
    {
      type: "image",
      src: `${dir}/making-it-simple.webp`,
      width: 600,
      height: 294.5,
      alt: "Order parameters beside the map, a capture-window date picker and live pricing",
    },
    {
      type: "section",
      level: 3,
      heading: "Let users make decisions as they go",
      body: [
        "This approach extended into the rest of the ordering journey. Instead of making users discover constraints at the end, we let them adjust parameters and check feasibility along the way.",
        "A change in date, location, or acquisition parameters could affect whether the order could be fulfilled. This allowed users to understand the implications of their choices.",
      ],
    },
    {
      type: "image",
      src: `${dir}/decisions.webp`,
      width: 600,
      height: 271,
      alt: "Upload to cloud storage dialog with GCS, Azure and Amazon S3 options, and a saved upload address",
    },
    {
      type: "section",
      level: 3,
      heading: "The order doesn't end at “Place Order”",
      body: [
        "Receiving an image isn't necessarily the end goal. A customer may need to move that imagery into their own databases, analysis pipelines, or cloud infrastructure.",
        "Order Desk lets users connect their preferred cloud storage and deliver ordered imagery directly to it, bringing the workflow closer to their existing data pipeline.",
      ],
    },
    {
      type: "image",
      src: `${dir}/archive.webp`,
      width: 600,
      height: 270.5,
      alt: "Explore view listing archive images for an area, each with capture date, satellite and cloud cover",
    },
    {
      type: "section",
      level: 3,
      heading: "Not every image needs to be captured",
      body: [
        "We also realised that not every customer needs a new satellite capture. Pixxel already has imagery stored in its archives, and in many cases the image a customer needs may already exist.",
        "Rather than making every user follow the same tasking journey, we provided two paths: capture something new or find something that has already been captured.",
        "This allowed the experience to be shaped around the customer's goal rather than the internal process behind it.",
      ],
    },
    {
      type: "section",
      heading: "Absorbing the complexity",
      body: [
        "The final product was shaped by a constant balance between complexity and simplicity, the idea was to make it feel less like an operational process and more like a clear, guided experience—one where users could understand what was possible, make informed decisions, and ultimately get the imagery they needed without having to understand everything happening behind it.",
        "The complexity stayed behind the interface.\nThe confidence stayed with the user.",
      ],
    },
  ],
};

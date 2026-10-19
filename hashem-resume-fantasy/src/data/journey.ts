export type ExperienceNode = {
  id: string;
  role: string;
  org: string;
  timeframe: string;
  location?: string;
  type?: "work" | "research" | "leadership";
  desc: string[];
  stack?: string[];
};

export const nodes: ExperienceNode[] = [
  {
    id: "zain-ml-intern",
    role: "Machine Learning Intern",
    org: "Zain",
    timeframe: "May 2025 – August 2025",
    location: "Amman, Jordan",
    type: "work",
    desc: [
      "Helped develop an AI-powered call-center assistant by implementing semantic search with OpenAI embeddings and a Pinecone vector database, enabling instant retrieval from hundreds of internal SOPs and support documents.",
      "Built a multilingual (English/Arabic) retrieval pipeline in Python (LangChain), including document cleaning/normalization, chunking, metadata tagging (department/product/version), and top-k retrieval for accurate grounded responses.",
      "Set up incremental indexing and retrieval filters to keep the knowledge base synchronized as documents changed and to prevent outdated content from being surfaced.",
      "Deployed the assistant to support 120+ customer-service agents per day, reducing average customer hold time by 22% across markets by eliminating manual lookup delays.",
    ],
    stack: [
      "Python",
      "LangChain",
      "OpenAI Embeddings",
      "Pinecone",
      "Semantic Search",
      "RAG",
      "Multilingual NLP",
    ],
  },
  {
    id: "ligadata-swe-intern",
    role: "Software Engineering Intern",
    org: "LigaData",
    timeframe: "January 2024 – June 2024",
    location: "Washington, DC",
    type: "work",
    desc: [
      "Conducted unit and integration testing with Postman, JUnit, and automation scripts to identify defects and validate functionality/performance.",
      "Integrated Python-based data pipelines with AI/ML components to improve Future Time Machine (FTM) processing of large-scale telecom subscriber datasets.",
      "Optimized FTM compliance workflows with real-time monitoring and resource-allocation logic, supporting deployments across multiple global telecom operators.",
      "Contributed to managed data-service capabilities that improved operator decision-making, resource optimization, and AI-driven analytics outcomes.",
    ],
    stack: [
      "Python",
      "Postman",
      "JUnit",
      "AI/ML Pipelines",
      "Data Engineering",
      "Monitoring",
      "Telecom Analytics",
    ],
  },
  {
    id: "mawdoo3-fullstack-intern",
    role: "Full-Stack Engineering Intern",
    org: "Mawdoo3",
    timeframe: "May 2023 – August 2023",
    location: "Amman, Jordan",
    type: "work",
    desc: [
      "Enhanced the Mawdoo3 platform (50M+ monthly users) by building responsive front-end features and improving usability with HTML, CSS, and JavaScript.",
      "Led login experience improvements by architecting semantic HTML and optimizing CSS for cross-device responsiveness, faster loads, and a cleaner UX.",
      "Contributed to a high-traffic Arabic content ecosystem accessed by millions, collaborating closely with engineers to deliver features on tight timelines.",
      "Worked across frontend and backend-adjacent workflows, gaining hands-on exposure to PHP, Python, and SQL while maintaining product quality at scale.",
    ],
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive UI",
      "PHP",
      "Python",
      "SQL",
      "Frontend Engineering",
    ],
  },
];

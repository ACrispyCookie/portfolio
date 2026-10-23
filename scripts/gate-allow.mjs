// Spec §11's allowed exceptions for the taste inspector, passed with its own --allow flag. Only what §11 writes down.
const PROJECT_PAGE = /^\/(courses\/[^/]+|projects)\/[^/]+\/?$/;

/** The inspector rules a page may break, each with its reason in spec §11. */
export const inspectAllow = (page) => [
  // a project page shows only the pictures Jason approved, never padded to the inspector's four (Jason, 2026-10-23)
  ...(PROJECT_PAGE.test(page) ? ['few-pictures'] : []),
];

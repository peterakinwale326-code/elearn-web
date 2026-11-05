console.error(
  "Generic curriculum enrichment is retired because it overwrote lessons with repeated template text. " +
  "Edit lesson content directly, then run scripts/validate-curriculum.mjs.",
);
process.exitCode = 1;

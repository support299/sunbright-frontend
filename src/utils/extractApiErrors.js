export function extractApiErrors(error) {
  const fallback = { fieldErrors: {}, generalErrors: ["Something went wrong."] };
  if (!error || !error.data) return fallback;

  const errors = error.data.errors || [];
  const fieldErrors = {};
  const generalErrors = [];

  errors.forEach((item) => {
    if (item.field) {
      fieldErrors[item.field] = fieldErrors[item.field] || [];
      fieldErrors[item.field].push(item.message);
      return;
    }
    generalErrors.push(item.message);
  });

  return {
    fieldErrors,
    generalErrors: generalErrors.length ? generalErrors : [],
  };
}

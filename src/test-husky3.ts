// A third test file for the Husky pre-commit hook
export function testHusky3() {
  const veryBadlyFormatted = "This string has lots of formatting issues";

  console.log(veryBadlyFormatted);
  return {
    success: true,
    message: "It worked!",
  };
}

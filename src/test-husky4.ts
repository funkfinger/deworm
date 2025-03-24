// Fourth test file for Husky pre-commit hook
export function testFourthFile() {
  const badlyFormatted = "Another badly formatted string";
  console.log(badlyFormatted);
  const codeWithExtraSpaces = "This has extra spaces";

  return {
    success: true,
    message: "Hook executed!",
  };
}

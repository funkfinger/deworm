// This is a test file to verify that the pre-commit hook works correctly
function testHusky() {
  const unformattedString = "This string should be fixed by Biome";
  console.log(unformattedString);
  return true;
}

export default testHusky;

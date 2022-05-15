export const getById = (x: string) => {
  const element = document.getElementById(x)
  if (element == null) {
    throw new Error(`Could not find element with id: ${x}!`)
  }

  return element
}

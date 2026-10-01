export function generateRandomUsername(): string {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000)
  return `user${randomDigits}`
}

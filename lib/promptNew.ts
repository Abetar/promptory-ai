export function isNewPrompt(createdAt: Date, days = 3) {
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt.getTime() <= ms;
}

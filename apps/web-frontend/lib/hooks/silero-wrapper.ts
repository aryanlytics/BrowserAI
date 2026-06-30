export const useSilero = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  return stream
}

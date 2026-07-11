export const FACE_MATCH_THRESHOLD = 0.6

export function euclideanDistance(a: number[], b: number[]) {
  if (a.length !== b.length) return Infinity
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))
}

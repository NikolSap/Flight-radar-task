export function getPlaneColor(country: string): [number, number, number] {
  if (country === "Israel") {
    return [0, 80, 255]
  }

  if (country === "Syria" || country === "Iran" || country === "Lebanon") {
    return [255, 0, 0]
  }

  return [255, 165, 0]
}

export function getPlaneLabel(country: string): string {
  if (country === "Israel") {
    return "Israel"
  }

  if (country === "Syria" || country === "Iran" || country === "Lebanon") {
    return "Enemy"
  }

  return "Neutral"
}

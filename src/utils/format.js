export function formatDistance(juli) {
  if (!juli && juli !== 0) {
    return '-'
  }
  return `距您${Number(juli).toFixed(1)}公里`
}

export function toList(data) {
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.data)) {
    return data.data
  }
  return []
}

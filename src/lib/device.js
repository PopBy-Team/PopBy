export const DEMO_LOCATION = [144.9788, -37.8005] // [lng, lat], Fitzroy
export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  new URLSearchParams(window.location.search).get('demo') === '1'

export function getDeviceId() {
  const key = 'popby_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

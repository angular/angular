export function isEditEvent(event: any) {
  return event.data.previous.exists() && event.data.exists();
}

export function isDeleteEvent(event: any) {
  return event.data.previous.exists() && !event.data.exists();
}

export function isCreateEvent(event: any) {
  return !event.data.previous.exists() && event.data.exists();
}

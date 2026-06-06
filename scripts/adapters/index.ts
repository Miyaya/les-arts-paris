import { ArtEvent } from '../../src/types/event'
import { fetchParisOpenData } from './parisOpenData'

export async function fetchAllEvents(): Promise<{ events: ArtEvent[]; counts: { paris_opendata: number } }> {
  let parisEvents: ArtEvent[] = []

  try {
    parisEvents = await fetchParisOpenData()
  } catch (err) {
    console.error('[paris-opendata] fetch failed:', err)
  }

  return {
    events: parisEvents,
    counts: { paris_opendata: parisEvents.length },
  }
}

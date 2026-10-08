/** Shared chronology data is also exposed by the Laravel read-only API. */
import records from '../../../shared/timeline.json'

const chronologyKey = item => item.sortDate ?? `${item.year}-01-01`

export const timeline = [...records].sort((a, b) => chronologyKey(a).localeCompare(chronologyKey(b)))
export const timelineCategories = ['all', 'botany', 'archive', 'research', 'heritage', 'conservation']

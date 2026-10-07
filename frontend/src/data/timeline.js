/** Shared chronology data is also exposed by the Laravel read-only API. */
import records from '../../../shared/timeline.json'

export const timeline = records
export const timelineCategories = ['all', 'botany', 'archive', 'research', 'heritage', 'conservation']

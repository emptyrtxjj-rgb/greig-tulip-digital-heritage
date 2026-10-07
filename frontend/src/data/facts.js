/** Shared factual records are also exposed by the Laravel read-only API. */
import records from '../../../shared/facts.json'

export const facts = records
export const factCategories = ['all', 'science', 'history', 'geography', 'conservation', 'heritage', 'archive']

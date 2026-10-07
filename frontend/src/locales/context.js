import { createContext, useContext } from 'react'

export const LocaleContext = createContext(null)
export const useLocale = () => useContext(LocaleContext)

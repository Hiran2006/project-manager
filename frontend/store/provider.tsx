"use client"

import { Provider } from "react-redux"
import { store, persistor } from "./store"
import { PersistGate } from "redux-persist/integration/react"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const loadingElement = (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-[#ff5a28] font-mono text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#ff5a28] border-t-transparent rounded-full animate-spin"></div>
        <div>INITIALIZING PROTOCOL...</div>
      </div>
    </div>
  )

  return (
    <Provider store={store}>
      <PersistGate loading={loadingElement} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

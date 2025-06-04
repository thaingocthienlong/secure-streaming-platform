// pages/_app.tsx
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme } from '../theme'
import '@/styles/globals.css'

import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...rest } = pageProps as any;
  return (
    <>
      <SessionProvider session={session}>
        <ThemeProvider theme={darkTheme}>
          <div className="min-h-screen flex flex-col">
            {/* … your header / main / footer … */}
            <CssBaseline />
            <Component {...rest} />
          </div>
        </ThemeProvider>

      </SessionProvider>
    </>
  )
}

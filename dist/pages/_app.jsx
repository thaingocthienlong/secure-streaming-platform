var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
// pages/_app.tsx
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from '../theme';
import '@/styles/globals.css';
export default function App({ Component, pageProps }) {
    const _a = pageProps, { session } = _a, rest = __rest(_a, ["session"]);
    return (<>
      <SessionProvider session={session}>
        <ThemeProvider theme={darkTheme}>
          <div className="min-h-screen flex flex-col">
            {/* … your header / main / footer … */}
            <CssBaseline />
            <Component {...rest}/>
          </div>
        </ThemeProvider>

      </SessionProvider>
    </>);
}

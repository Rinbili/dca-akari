import type { DefaultSession, NextAuthConfig } from 'next-auth'
declare module '@auth/core/types' {
  interface Session {
    user: {
      uid: string
      id: string
      isAdmin: boolean
      // ...other properties
    } & DefaultSession['user']
  }
  interface auth {
    user: {
      uid: string
      id: string
      isAdmin: boolean
      // ...other properties
    }
  }
  interface User {
    uid: string
    id: string
    isAdmin: boolean
  }
  interface authorize {
    auth: {
      user: {
        uid: string
        id: string
        isAdmin: boolean
        // ...other properties
      }
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    identifier: string
    name: string
    role: 'USER' | 'ADMIN'
  }
}

export const authConfig = {
  pages: {
    signIn: '/cas',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.uid = user.uid
        token.isAdmin = user.isAdmin
      }
      return token
    },

    session({ session, token }) {
      session.user.id = token.id as string
      session.user.uid = token.uid as string
      session.user.isAdmin = token.isAdmin as boolean
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/profile')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return true // If authenticated, allow the request
      }
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
  trustHost: true,
} satisfies NextAuthConfig

import NextAuth, { DefaultSession, User } from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/cas',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const token = (credentials.token as string) || ''
        if (!token) {
          return null
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        let user
        user = await prisma.user.findUnique({
          where: {
            uid: (decoded as { uid: string }).uid,
          },
        })
        if (!user) {
          user = await prisma.user.create({
            data: {
              uid: (decoded as { uid: string }).uid,
            },
          })
        }
        return user
      },
    }),
  ],
})

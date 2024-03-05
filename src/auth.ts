import NextAuth, { DefaultSession, User } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { authByCAS } from './lib/actions';
import { XMLParser } from 'fast-xml-parser';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/cas',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const ticket = (credentials.ticket as string) || '';
        if (!ticket) {
          return null;
        }
        const dataStr = await authByCAS(ticket);
        const parser = new XMLParser();
        const data: authResp = parser.parse(dataStr);
        if (!!data['cas:serviceResponse']['cas:authenticationSuccess']) {
          const uid = String(
            data['cas:serviceResponse']['cas:authenticationSuccess'][
              'cas:user'
            ],
          );
          let user;
          user = await prisma.user.findUnique({
            where: {
              uid: uid,
            },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                uid: uid,
              },
            });
          }
          return user;
        }
        return null;
      },
    }),
  ],
});

type authResp = {
  'cas:serviceResponse': {
    'cas:authenticationFailure'?: string;
    'cas:authenticationSuccess'?: {
      'cas:user': string | number;
      'cas:attributes': {
        'cas:isFromNewLogin': boolean;
        'cas:authenticationDate': string;
        'cas:loginType': number;
        'cas:successfulAuthenticationHandlers': string;
        'cas:ip': string;
        'cas:USER_LOGIN_DATE': string;
        'cas:userName': string;
        'cas:ua': string;
        'cas:samlAuthenticationStatementAuthMethod': string;
        'cas:credentialType': string;
        'cas:authenticationMethod': string;
        'cas:longTermAuthenticationRequestTokenUsed': boolean;
        'cas:containerId': string;
        'cas:cllt': string;
        'cas:dllt': string;
        'cas:USER_LOGIN_TYPE': number;
      };
    };
  };
};

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const client = await prisma.client.findUnique({
                    where: { email: credentials.email },
                    include: { metaAdAccounts: true }, // Incluir contas de anúncios
                });

                if (!client) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    client.passwordHash
                );

                if (!isPasswordValid) {
                    return null;
                }

                if (!client.isActive) {
                    throw new Error("Usuário inativo.");
                }

                const primaryAdAccount = client.metaAdAccounts?.[0];

                return {
                    id: client.id,
                    clientId: client.id,
                    email: client.email,
                    name: client.name,
                    role: client.role,
                    isActive: client.isActive,
                    image: client.image,
                    metaAdAccount: primaryAdAccount ? {
                        id: primaryAdAccount.id,
                        adAccountId: primaryAdAccount.adAccountId,
                        name: primaryAdAccount.name,
                        status: primaryAdAccount.status,
                    } : null,
                } as any;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.clientId = user.clientId;
                token.role = user.role;
                token.isActive = user.isActive;
                token.image = user.image;
                token.metaAdAccount = user.metaAdAccount;
            }

            // Se o token já existe (usuário logado), buscar dados atualizados do banco
            if (token.clientId) {
                const dbUser = await prisma.client.findUnique({
                    where: { id: token.clientId },
                    include: { metaAdAccounts: true }, // Updated to fetch all accounts
                });

                if (dbUser) {
                    // Select the first account or handle selection logic later
                    const primaryMetaAccount = dbUser.metaAdAccounts[0];

                    token.metaAdAccount = primaryMetaAccount ? {
                        id: primaryMetaAccount.id,
                        adAccountId: primaryMetaAccount.adAccountId,
                        name: primaryMetaAccount.name || "",
                        status: primaryMetaAccount.status,
                    } : null;

                    token.role = dbUser.role;
                    token.isActive = dbUser.isActive;
                    token.image = dbUser.image;

                    // Profile Fields
                    token.phone = dbUser.phone;
                    token.birthDate = dbUser.birthDate;
                    token.address = dbUser.address;
                    token.termsAccepted = dbUser.termsAccepted;
                    token.lgpdConsent = dbUser.lgpdConsent;

                    // Calculate Profile Completeness
                    token.isProfileComplete = !!(
                        dbUser.phone &&
                        dbUser.birthDate &&
                        dbUser.address &&
                        dbUser.termsAccepted &&
                        dbUser.lgpdConsent
                    );
                }
            }

            // Permitir atualização da sessão via client-side (ex: update({ image: ... }))
            if (trigger === "update" && session?.image) {
                token.image = session.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.clientId = token.clientId;
                session.user.role = token.role;
                session.user.isActive = token.isActive;
                session.user.image = token.image;
                session.user.metaAdAccount = token.metaAdAccount;

                // New Fields
                session.user.phone = token.phone;
                session.user.birthDate = token.birthDate;
                session.user.address = token.address;
                session.user.isProfileComplete = token.isProfileComplete;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
};

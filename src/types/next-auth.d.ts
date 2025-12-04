import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The client's ID. */
            clientId: string
            role: Role
            isActive: boolean
            image?: string | null
            metaAdAccount?: {
                id: string
                adAccountId: string
                name: string
                status: string
            } | null

            // Profile Fields
            phone?: string | null
            birthDate?: Date | null
            address?: any | null
            termsAccepted?: boolean
            lgpdConsent?: boolean
            isProfileComplete?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        clientId: string
        role: Role
        isActive: boolean
        image?: string | null
        metaAdAccount?: {
            id: string
            adAccountId: string
            name: string
            status: string
        } | null

        // Profile Fields
        phone?: string | null
        birthDate?: Date | null
        address?: any | null
        termsAccepted?: boolean
        lgpdConsent?: boolean
        isProfileComplete?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        clientId: string
        role: Role
        isActive: boolean
        image?: string | null
        metaAdAccount?: {
            id: string
            adAccountId: string
            name: string
            status: string
        } | null

        // Profile Fields
        phone?: string | null
        birthDate?: Date | null
        address?: any | null
        termsAccepted?: boolean
        lgpdConsent?: boolean
        isProfileComplete?: boolean
    }
}

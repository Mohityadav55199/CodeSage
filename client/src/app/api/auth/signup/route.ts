import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, createSessionForUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { email, password, name, imageUrl } = await req.json()
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing email or password' },
                { status: 400 }
            )
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
        }

        const hashed = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
                imageUrl: imageUrl ?? null, // ✅ Save uploaded image or fallback null
            },
        })

        const session = await createSessionForUser(user.id)

        const cookieStore = await cookies()
        cookieStore.set({
            name: 'session',
            value: session.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: session.expiresAt,
        })

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                imageUrl: user.imageUrl,
            },
        })
    } catch (err: any) {
        console.error("Signup error:", err)
        const isDbError = err?.message?.includes("Can't reach database server") || err?.code === 'P1001'
        const errorMessage = isDbError
            ? 'Cannot connect to database. Please check your PostgreSQL server or DATABASE_URL in .env'
            : (err?.message || 'Server error')
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

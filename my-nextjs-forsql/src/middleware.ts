import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"

export function middleware(request : NextRequest){
    console.log('hi middleware')
    return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
    matcher : '/test/:path*'
}
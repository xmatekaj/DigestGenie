'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { signIn, signOut } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Test your authentication setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">Status: </span>
            <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>

          {session?.user && (
            <div className="space-y-2">
              <div><span className="font-semibold">Email:</span> {session.user.email}</div>
              <div><span className="font-semibold">Name:</span> {session.user.name || 'Not set'}</div>
            </div>
          )}

          <div className="flex gap-2">
            {!session ? (
              <Button onClick={() => signIn('google')}>Sign In with Google</Button>
            ) : (
              <Button onClick={() => signOut()}>Sign Out</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
import UserSearch from '@/components/UserSearch';

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>
      <UserSearch />
    </div>
  );
}

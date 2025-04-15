import ArtistProfile from '@/components/artistpage/ArtistProfile';
import { Suspense } from 'react';
import Loading from '@/app/loading';

export default function ArtistPage({ params }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <ArtistProfile artistName={params.name} />
      </Suspense>
    </div>
  );
}
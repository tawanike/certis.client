'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MatterWorkspace from '@/components/matter/MatterWorkspace';

export default function MatterPage() {
    const params = useParams();
    const matterId = params.id as string;

    return <MatterWorkspace matterId={matterId} />;
}

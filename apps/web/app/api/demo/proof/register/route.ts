import { NextResponse } from 'next/server';

import { registerProofOnChainForRun } from '../../../../dashboard/demo-run-service';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const caseId = body && typeof body === 'object' && 'caseId' in body ? body.caseId : null;
  const storageRootHash =
    body && typeof body === 'object' && 'storageRootHash' in body ? body.storageRootHash : null;

  if (typeof caseId !== 'string' || caseId.trim().length === 0) {
    return NextResponse.json({ error: 'caseId is required.' }, { status: 400 });
  }

  if (storageRootHash !== null && typeof storageRootHash !== 'string') {
    return NextResponse.json({ error: 'storageRootHash must be a string when provided.' }, { status: 400 });
  }

  const result = await registerProofOnChainForRun(caseId.trim(), typeof storageRootHash === 'string' ? storageRootHash : null);

  if (!result) {
    return NextResponse.json({ error: 'Case was not found.' }, { status: 404 });
  }

  if (result.run.proofRecord.lastErrorMessage) {
    return NextResponse.json(
      {
        error: result.run.proofRecord.lastErrorMessage,
        ...result,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result);
}

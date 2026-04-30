import { NextResponse } from 'next/server';
import { parseSimulatedAgentAction, runSimulatedAgentAction } from '../../../dashboard/demo-run-service';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const caseId = body && typeof body === 'object' && 'caseId' in body ? body.caseId : null;
  const action = parseSimulatedAgentAction(body && typeof body === 'object' && 'action' in body ? body.action : null);

  if (typeof caseId !== 'string' || caseId.length === 0 || !action) {
    return NextResponse.json({ error: 'caseId and a supported simulated agent action are required.' }, { status: 400 });
  }

  const result = await runSimulatedAgentAction(caseId, action);

  if (!result) {
    return NextResponse.json({ error: 'Case or simulated action is not available.' }, { status: 404 });
  }

  return NextResponse.json(result);
}

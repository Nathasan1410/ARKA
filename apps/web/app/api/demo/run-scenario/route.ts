import { NextResponse } from 'next/server';
import { parseScenarioKey, runDashboardScenario } from '../../../dashboard/demo-run-service';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const scenarioKey = parseScenarioKey(
    body && typeof body === 'object' && 'scenarioKey' in body ? body.scenarioKey : null,
  );

  if (!scenarioKey) {
    return NextResponse.json({ error: 'scenarioKey must be STATE_A, STATE_C, or STATE_D.' }, { status: 400 });
  }

  const result = await runDashboardScenario(scenarioKey);

  return NextResponse.json(result);
}

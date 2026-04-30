import { NextResponse } from 'next/server';
import { runAdminMovementSimulation } from '../../../dashboard/demo-run-service';
import type { AdminSimulationInput } from '../../../dashboard/dashboard-data';

const MAX_ORDER_QUANTITY = 20;
const MAX_MOVEMENT_GRAMS = 1000;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const input = parseAdminSimulationInput(body);

  if (!input) {
    return NextResponse.json(
      {
        error: `orderQuantity must be 1-${MAX_ORDER_QUANTITY} and actualMovementGrams must be 0-${MAX_MOVEMENT_GRAMS}.`,
      },
      { status: 400 },
    );
  }

  const result = await runAdminMovementSimulation(input);

  return NextResponse.json(result);
}

function parseAdminSimulationInput(value: unknown): AdminSimulationInput | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const orderQuantity = Number((value as { orderQuantity?: unknown }).orderQuantity);
  const actualMovementGrams = Number((value as { actualMovementGrams?: unknown }).actualMovementGrams);

  if (
    !Number.isInteger(orderQuantity) ||
    !Number.isInteger(actualMovementGrams) ||
    orderQuantity < 1 ||
    orderQuantity > MAX_ORDER_QUANTITY ||
    actualMovementGrams < 0 ||
    actualMovementGrams > MAX_MOVEMENT_GRAMS
  ) {
    return null;
  }

  return {
    orderQuantity,
    actualMovementGrams,
  };
}

import { NextResponse } from 'next/server';
import { getDemoRunRepository } from '../../../dashboard/demo-run-service';

export async function DELETE() {
  try {
    const repo = getDemoRunRepository();
    await repo.resetHistory();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear demo runs:', error);
    return NextResponse.json({ error: 'Failed to clear demo runs' }, { status: 500 });
  }
}

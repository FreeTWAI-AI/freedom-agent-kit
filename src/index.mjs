// Deliberately source-valid but behaviorally invalid canary.
export async function loadMemberWorkspace() { return { status: 'passed', canary: 'stub' }; }

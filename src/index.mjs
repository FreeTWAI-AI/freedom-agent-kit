// Deliberate actual-main runtime rejection probe; vendor and locks unchanged.
export async function loadMemberWorkspace() { return { status: 'passed', canary: 'main-stub' }; }

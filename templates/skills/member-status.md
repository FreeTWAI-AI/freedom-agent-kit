# Read my member status

Use the injected, authenticated Platform client to call `loadMemberWorkspace`.
Explain available work, member-selected direction, and Guild participation using the returned facts.
Keep credentials out of prompts and artifacts. Reading does not authorize claiming, publishing, paying, or changing member records.
If the server reports a protocol mismatch, authentication expiry, or unavailable state, report it; do not fabricate empty data.

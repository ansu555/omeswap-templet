import { redirect } from 'next/navigation'

/** Old path; publishing is on `/agent-builder`. */
export default function LegacyCreatorPathRedirect() {
  redirect('/agent-builder')
}
